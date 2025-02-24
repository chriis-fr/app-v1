interface CalendlyWidget {
  initPopupWidget: (options: {
    url: string;
    prefill?: Record<string, unknown>;
    text?: string;
    color?: string;
    textColor?: string;
  }) => void;
}

interface Window {
  Calendly: CalendlyWidget;
} 