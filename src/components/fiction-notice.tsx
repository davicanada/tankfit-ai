import { FlaskConical } from "lucide-react";

export function FictionNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className="border-b border-amber-400/20 bg-amber-400/8">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 text-xs text-amber-100/90 sm:px-6 lg:px-8">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
        <p>
          <span className="font-semibold text-amber-200">Synthetic demonstration.</span>{" "}
          {compact
            ? "Every company, product, specification, and recommendation shown here is fictional."
            : "This independent project uses fictional companies, products, specifications, prices, and recommendations created exclusively for the Jornada de Dados competition. Do not enter real personal or confidential information."}
        </p>
      </div>
    </div>
  );
}
