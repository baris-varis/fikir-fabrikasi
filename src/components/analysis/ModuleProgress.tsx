'use client';

const MODULES = [
  { key: 'A', icon: '🔍', label: 'Keşif', color: 'blue' },
  { key: 'B', icon: '⚔️', label: 'Rekabet', color: 'purple' },
  { key: 'C', icon: '🎯', label: 'Strateji', color: 'amber' },
  { key: 'D', icon: '📊', label: 'Final', color: 'emerald' },
];

interface Props {
  activeModule: string;
  completedModules: string[];
}

export default function ModuleProgress({ activeModule, completedModules }: Props) {
  return (
    <div className="flex items-center gap-1">
      {MODULES.map((mod, i) => {
        const isCompleted = completedModules.includes(mod.key);
        const isActive = activeModule === mod.key;
        const isPending = !isCompleted && !isActive;

        return (
          <div key={mod.key} className="flex items-center">
            <div
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${isActive ? 'bg-fab-accent/20 text-fab-accent ring-1 ring-fab-accent/30' : ''}
                ${isCompleted ? 'bg-fab-success/10 text-fab-success' : ''}
                ${isPending ? 'bg-fab-surface text-fab-muted' : ''}
              `}
            >
              <span>{isCompleted ? '✓' : mod.icon}</span>
              <span className="hidden sm:inline">{mod.label}</span>
              <span className="sm:hidden">{mod.key}</span>
            </div>
            {i < MODULES.length - 1 && (
              <div
                className={`w-4 h-px mx-0.5 ${
                  isCompleted ? 'bg-fab-success/40' : 'bg-fab-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
