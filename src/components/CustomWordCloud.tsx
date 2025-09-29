'use client'
import { useTheme } from 'next-themes'
import React from 'react'
import D3WordCloud from "react-d3-cloud"
type Props = {}

const data = [
  { text: "Hey", value: 3 },
  { text: "React", value: 15 },
  { text: "Next.js", value: 10 },
  { text: "Prisma", value: 8 },
  { text: "TypeScript", value: 12 },
  { text: "Tailwind", value: 9 },
  { text: "Node.js", value: 14 },
  { text: "Express", value: 7 },
  { text: "MongoDB", value: 11 },
  { text: "Postgres", value: 13 },
  { text: "Solana", value: 6 },
  { text: "Ethereum", value: 5 },
  { text: "Blockchain", value: 16 },
  { text: "AI", value: 20 },
  { text: "Cloud", value: 18 },
  { text: "Docker", value: 17 },
  { text: "Kubernetes", value: 19 },
  { text: "GitHub", value: 9 },
  { text: "OpenAI", value: 12 },
  { text: "Quiz", value: 4 }
];

const fontSizeMapper= (word:{value: number})=>{
    return Math.log2(word.value) * 5 + 16;
}

const CustomWordCloud = (props: Props) => {
  const theme = useTheme();
    return (
    <>
    <D3WordCloud
    data={data}
      height={550}
      font='Times'
      fontSize={fontSizeMapper}
      rotate={0}
      padding={10}
      fill={theme.theme == 'dark' ?"white":"black"}

      />
    </>
  )
}

export default CustomWordCloud