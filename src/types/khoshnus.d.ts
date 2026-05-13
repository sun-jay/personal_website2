declare module 'khoshnus' {
  interface ManuscriptInit {
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
  }

  interface WriteConfig {
    writeConfiguration?: {
      eachLetterDelay?: number;
      delayOperation?: number;
    };
    textElementAttributes?: {
      x?: string | number;
      y?: string | number;
      textAnchor?: string;
      dominantBaseline?: string;
      fontSize?: string;
    };
  }

  export class Manuscript {
    constructor(config: ManuscriptInit);
    write(text: string, config?: WriteConfig): string;
    erase(textId: string, config?: { delayOperation?: number }): void;
  }
}
