import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({}); 

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gemini-2.5-flash",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<any> {
  const list_input: boolean = Array.isArray(user_prompt);
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));

  let error_msg = "";

  for (let attempt = 0; attempt < num_tries; attempt++) {
   
    let output_format_prompt = `\nYou are to output the following in json format: ${JSON.stringify(
      output_format
    )}. Do not put extra quotation marks or escape characters in the output fields.`;

    if (list_output) {
      output_format_prompt += `\nIf an output field is a list, choose the best single element from the list (the primary label).`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it.`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate a list of JSON objects; one JSON per input element.`;
    }

    // final prompt string sent to Gemini
    const userContent = Array.isArray(user_prompt)
      ? user_prompt.join("\n")
      : user_prompt.toString();
    const finalPrompt = system_prompt + output_format_prompt + error_msg + "\n" + userContent;

    if (verbose) {
      console.log("=== strict_output: attempt", attempt + 1);
      console.log("System + format prompt:", system_prompt + output_format_prompt + error_msg);
      console.log("User prompt:", userContent);
    }

    try {
      // call Gemini
      const response = await ai.models.generateContent({
        model,
        contents: finalPrompt,
        // generationConfig or temperature may be supported by the SDK
        // keep this in case your version accepts it
        generationConfig: { temperature },
      } as any);

      // defensive retrieval of the text
      let res: string =
        (response as any)?.text ??
        (typeof response === "string" ? response : JSON.stringify(response));

      // normalize quotes a bit (same approach as your original)
      res = res.replace(/'/g, '"');
      // try not to convert intra-word quotes
      res = res.replace(/(\w)"(\w)/g, "$1'$2");

      if (verbose) {
        console.log("Gemini raw response:", res);
      }

      // parse JSON
      let parsed = JSON.parse(res);

      // normalize into an array of objects for downstream validation
      if (!list_input) {
        if (Array.isArray(parsed)) {
          // if the model returned an array for a single input, take the first
          parsed = parsed[0];
        }
        parsed = [parsed];
      } else {
        if (!Array.isArray(parsed)) {
          throw new Error("Expected a list of JSON objects for list input.");
        }
      }

      // Validate and normalize each object against output_format
      for (let i = 0; i < parsed.length; i++) {
        const obj = parsed[i];

        for (const key in output_format) {
          // skip dynamic output header checks because they can change
          if (/<.*?>/.test(key)) continue;

          if (!(key in obj)) {
            throw new Error(`${key} not in json output`);
          }

          // if expected field is a list of choices, ensure the output is a single label (or fallback)
          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];

            // if model returns a list, pick first element
            if (Array.isArray(obj[key])) {
              obj[key] = obj[key][0];
            }

            if (!choices.includes(obj[key]) && default_category) {
              obj[key] = default_category;
            }

            if (typeof obj[key] === "string" && obj[key].includes(":")) {
              obj[key] = obj[key].split(":")[0];
            }
          }
        }

        // if user asked to only return values
        if (output_value_only) {
          parsed[i] = Object.values(parsed[i]);
          if (Array.isArray(parsed[i]) && parsed[i].length === 1) {
            parsed[i] = parsed[i][0];
          }
        }
      }

      // return array if input was a list, else single element
      return list_input ? parsed : parsed[0];
    } catch (err: any) {
      // log and prepare the error message to help next retry
      error_msg = `\n\nResult: ${(err && err.message) || err}\n\n`;
      if ((err as any)?.message) {
        // include the last raw snippet if available (best-effort)
        try {
          const lastRaw = (err as any).responseText ?? "";
          if (lastRaw) error_msg += `Last response snippet: ${String(lastRaw)}\n\n`;
        } catch {}
      }
      console.warn("strict_output attempt failed:", err);
      // continue to next attempt with error context prepended to the prompt
    }
  }

  // if all retries fail return empty array (same as your original behavior)
  return [];
}
