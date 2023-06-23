import { Group, Select, Text } from "@mantine/core";
import {
  IconAbacus,
  IconAssembly,
  IconBrandCSharp,
  IconBrandCpp,
  IconBrandCss3,
  IconBrandFirefox,
  IconBrandGolang,
  IconBrandJavascript,
  IconBrandKotlin,
  IconBrandPhp,
  IconBrandPython,
  IconBrandRust,
  IconBrandSwift,
  IconBrandTypescript,
  IconBrandVisualStudio,
  IconCoffee,
  IconHtml,
  IconLetterC,
  IconLetterR,
  IconPoint,
  IconSql,
} from "@tabler/icons-react";
import { ReactNode, forwardRef } from "react";

const LANGUAGES = [
  "Python",
  "C",
  "C++",
  "Java",
  "C#",
  "Visual Basic",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS3",
  "CSS4",
  "PHP",
  "SQL",
  "Go",
  "R",
  "Swift",
  "Rust",
  "Assembly language",
  "Kotlin",
  "MATLAB",
  "Delphi",
  "Object Pascal",
  "Fortran",
  "Classic Visual Basic",
  "Ruby",
  "FoxPro",
  "COBOL",
  "SAS",
  "Objective-C",
  "Perl",
  "Ada",
  "Julia",
  "D",
  "Transact-SQL",
  "Haskell",
  "Lua",
  "Lisp",
  "Dart",
  "Scala",
  "Prolog",
  "PL/SQL",
  "Scheme",
  "VBScript",
  "F#",
  "ABAP",
  "X++",
  "CFML",
  "Awk",
  "ML",
  "Raku",
  "Forth",
  "Apex",
  "Elixir",
  "Elm",
  "PureScript",
  "ReasonML",
  "CoffeeScript",
  "ClojureScript",
  "Haxe",
] as const;

type Languages = (typeof LANGUAGES)[number];

const LANGUAGE_ICONS: Partial<Record<Languages, ReactNode>> = {
  Python: <IconBrandPython stroke={1.2} />,
  C: <IconLetterC stroke={1.2} />,
  "C++": <IconBrandCpp stroke={1.2} />,
  Java: <IconCoffee stroke={1.2} />,
  "C#": <IconBrandCSharp stroke={1.2} />,
  "Visual Basic": <IconBrandVisualStudio stroke={1.2} />,
  JavaScript: <IconBrandJavascript stroke={1.2} />,
  PHP: <IconBrandPhp stroke={1.2} />,
  Go: <IconBrandGolang stroke={1.2} />,
  R: <IconLetterR stroke={1.2} />,
  Swift: <IconBrandSwift stroke={1.2} />,
  Rust: <IconBrandRust stroke={1.2} />,
  Kotlin: <IconBrandKotlin stroke={1.2} />,
  TypeScript: <IconBrandTypescript stroke={1.2} />,
  SQL: <IconSql stroke={1.2} />,
  "Assembly language": <IconAssembly stroke={1.2} />,
  MATLAB: <IconAbacus stroke={1.2} />,
  HTML: <IconHtml stroke={1.2} />,
  CSS3: <IconBrandCss3 stroke={1.2} />,
  CSS4: <IconBrandFirefox stroke={1.2} />,
};

const ItemComponent = forwardRef<HTMLDivElement, { value: string }>(
  ({ value, ...rest }, ref) => {
    return (
      <div ref={ref} {...rest}>
        <Group noWrap>
          {LANGUAGE_ICONS[value as keyof typeof LANGUAGE_ICONS] || (
            <IconPoint stroke={1.2} />
          )}

          <Text size="xs" component="div" lineClamp={1}>
            {value}
          </Text>
        </Group>
      </div>
    );
  }
);
type Props = { value: string; onSelect(language: string): void };
export const CoderLanguageSelector = ({ value, onSelect }: Props) => {
  return (
    <Select
      data={LANGUAGES}
      value={value as Languages}
      onChange={onSelect}
      label="Language"
      placeholder="Select language"
      radius="xl"
      autoFocus={false}
      searchable
      withAsterisk
      nothingFound="No options"
      withinPortal
      itemComponent={ItemComponent}
    />
  );
};
