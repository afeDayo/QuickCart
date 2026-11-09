// SectionHeader
// Small blue label + section title on the left, and optional content on the right (a link, arrows or a note)
// Used on: Home sections

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  titleId: string;
  eyebrowIcon?: IconType;
  eyebrowIconSize?: number;
  children?: ReactNode;
};

const SectionHeader = ({
  eyebrow,
  title,
  titleId,
  eyebrowIcon: EyebrowIcon,
  eyebrowIconSize = 15,
  children,
}: SectionHeaderProps) => {
  return (
    <header className="mb-4 flex items-center justify-between gap-4">
      <div>
        <p
          className={`flex items-center gap-1.5 text-[11px] leading-3.5 font-bold tracking-wider text-primary uppercase`}
        >
          {EyebrowIcon && (
            <EyebrowIcon
              size={eyebrowIconSize}
              aria-hidden="true"
              style={{ marginInline: -eyebrowIconSize * 0.075 }}
            />
          )}{" "}
          {eyebrow}
        </p>

        <h2
          id={titleId}
          className="text-[23px] leading-7 font-semibold tracking-tight text-ink"
        >
          {title}
        </h2>
      </div>
      {children}
    </header>
  );
};

export default SectionHeader;
