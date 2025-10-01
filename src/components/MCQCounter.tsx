import { CheckCircle, XCircle } from "lucide-react";
import React from "react";
import { Separator } from "./ui/separator";

type Props = {
  correctAnswers: number;
  wrongAnswers: number;
};

const MCQCounter = ({correctAnswers, wrongAnswers}: Props) => {
  return (
    <div className="flex flex-row items-center justify-center p-2">
      <CheckCircle color="green" size={30} />
      <span className="mx-2 text-2xl text-[green]">{correctAnswers}</span>
      <Separator orientation="vertical" />
      <span className="mx-3 text-2xl text-[red]">{wrongAnswers}</span>
      <XCircle color="red" size={30} />
    </div>
  );
};

export default MCQCounter;
