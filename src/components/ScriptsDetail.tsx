import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { ScriptItem } from "@/types/script";

interface ScriptsDetailProps {
  scripts: ScriptItem[];
}

const ScriptsDetail = ({ scripts }: ScriptsDetailProps) => {
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(scripts[0]?.id ?? null);

  const selectedScript = useMemo(
    () => scripts.find((script) => script.id === selectedScriptId) ?? scripts[0],
    [scripts, selectedScriptId]
  );

  if (!selectedScript) {
    return (
      <div className="space-y-6">
        <div className="bg-primary inline-block px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5">
          <h2 className="text-primary-foreground font-bebas font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            Scripts
          </h2>
        </div>
        <p className="text-card-foreground font-bebas text-2xl md:text-3xl">
          Nenhum script cadastrado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10">
      <div className="bg-primary inline-block px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5">
        <h2 className="text-primary-foreground font-bebas font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          Scripts
        </h2>
      </div>

      <div className="grid gap-4 md:gap-6 lg:gap-8 md:grid-cols-[280px_1fr]">
        <aside className="bg-sidebar-light rounded p-3">
          <h3 className="font-bebas font-bold text-card-foreground text-2xl mb-3">Lista</h3>
          <div className="space-y-2">
            {scripts.map((script) => (
              <button
                key={script.id}
                type="button"
                onClick={() => setSelectedScriptId(script.id)}
                className={`w-full text-left rounded px-3 py-2 font-bebas font-bold text-xl transition-colors ${
                  selectedScript.id === script.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary hover:text-primary-foreground text-card-foreground"
                }`}
              >
                {script.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-4 md:space-y-5">
          <div className="flex items-center gap-3">
            <h3 className="font-bebas font-bold text-card-foreground text-3xl md:text-4xl">
              {selectedScript.name}
            </h3>
            {selectedScript.link && (
              <a
                href={selectedScript.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded px-3 py-1 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-bebas text-lg">Abrir referência</span>
              </a>
            )}
          </div>

          <div>
            <h4 className="font-bebas font-bold text-2xl md:text-3xl text-card-foreground">Explicação</h4>
            <p className="text-card-foreground text-base md:text-lg whitespace-pre-line">
              {selectedScript.summary}
            </p>
          </div>

          <div>
            <h4 className="font-bebas font-bold text-2xl md:text-3xl text-card-foreground">Como funciona</h4>
            <p className="text-card-foreground text-base md:text-lg whitespace-pre-line">
              {selectedScript.howItWorks}
            </p>
          </div>

          <div>
            <h4 className="font-bebas font-bold text-2xl md:text-3xl text-card-foreground">Como usar</h4>
            <p className="text-card-foreground text-base md:text-lg whitespace-pre-line">
              {selectedScript.usage}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScriptsDetail;
