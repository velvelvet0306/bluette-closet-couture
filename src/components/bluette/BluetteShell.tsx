import React from 'react';
import { Navigation } from './Navigation';
import { BluetteLogo, PuffyStar } from './BrandDecorations';
import { BluetteProvider, useBluette } from './BluetteProvider';

function ShellFrame({ children }: { children: React.ReactNode }) {
  const { toastMessage, triggerUpload, wardrobe } = useBluette();

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col selection:bg-sky/50 selection:text-ink bg-halftone-dots">
      {/* 3D Floating Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 right-6 z-50 bg-ink text-paper px-5 py-3 rounded-full font-round font-bold text-xs flex items-center gap-2.5 border-2 border-paper shadow-[0_6px_20px_color-mix(in_oklab,var(--color-ink)_35%,transparent)] animate-fade-in"
        >
          <PuffyStar color="yellow" size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <Navigation onTriggerUpload={triggerUpload} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 lg:px-12 pt-6">{children}</main>

      {/* Whimsical 3D Footer */}
      <footer className="mt-auto border-t-2 border-ice bg-paper/90 backdrop-blur-md py-6 px-6 lg:px-12 shadow-[0_-4px_20px_color-mix(in_oklab,var(--color-sky)_25%,transparent)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-helvetica text-xs text-dusk">
          <div className="flex items-center gap-3">
            <BluetteLogo size="sm" />
            <span className="font-round text-xs font-bold text-ink">
              — personal digital closet & outfit studio
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-round font-medium text-fog">
            <span className="flex items-center gap-1.5">
              <PuffyStar color="yellow" size={14} />
              {wardrobe.length} clothing item{wardrobe.length !== 1 ? 's' : ''} in closet
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function BluetteShell({ children }: { children: React.ReactNode }) {
  return (
    <BluetteProvider>
      <ShellFrame>{children}</ShellFrame>
    </BluetteProvider>
  );
}
