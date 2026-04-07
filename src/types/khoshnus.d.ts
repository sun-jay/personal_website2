declare module 'khoshnus' {
  export class Manuscript {
    constructor(config: {
      svgId: string;
      font: string;
      fontSize: string;
      start?: {
        startStrokeDashoffset?: number;
        startStroke?: string;
        startStrokeWidth?: number;
        startFill?: string;
      };
      end?: {
        endStrokeDashoffset?: number;
        endStroke?: string;
        endStrokeWidth?: number;
        endFill?: string;
      };
      durations?: {
        strokeDashoffsetDuration?: number;
        strokeWidthDuration?: number;
        strokeDuration?: number;
        fillDuration?: number;
      };
    });
    write(
      text: string,
      config?: {
        textElementAttributes?: {
          x?: string;
          y?: string;
          textAnchor?: string;
          dominantBaseline?: string;
          fontSize?: string;
        };
        writeConfiguration?: {
          eachLetterDelay?: number;
          delayOperation?: number;
        };
      }
    ): string;
    erase(
      textId: string,
      config?: {
        delayOperation?: number;
        delayEraseStrokeDashoffset?: number;
        delayEraseStrokeWidth?: number;
        delayEraseStroke?: number;
        delayEraseFill?: number;
      }
    ): void;
  }

  export const FONT_MATRIX: Record<
    string,
    { name: string; strokeDashoffset: number }
  >;
}

declare module 'khoshnus/style.css';
