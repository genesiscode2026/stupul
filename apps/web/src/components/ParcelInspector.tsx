import React from 'react';
import { Parcel, BUILDING_DEFINITIONS, PARCEL_BASE_PRICE_CREDITS, BuildingType } from '@stupul/engine';
import { X, MapPin, Building, ArrowUpCircle, Trash2, Coins, Shield } from 'lucide-react';

interface ParcelInspectorProps {
  parcel: Parcel | null;
  onClose: () => void;
  onClaim: (x: number, y: number) => void;
  onBuild: (x: number, y: number, type: BuildingType) => void;
  onUpgrade: (x: number, y: number) => void;
  onDemolish: (x: number, y: number) => void;
  availableMaterials: number;
  availableCredits: number;
}

export const ParcelInspector: React.FC<ParcelInspectorProps> = ({
  parcel,
  onClose,
  onClaim,
  onBuild,
  onUpgrade,
  onDemolish,
  availableMaterials,
  availableCredits
}) => {
  if (!parcel) return null;

  const buildingDef = parcel.building ? BUILDING_DEFINITIONS[parcel.building] : null;

  return (
    <aside className="absolute top-16 right-4 w-72 frontier-panel rounded-lg p-4 z-20 shadow-2xl flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-amber-400" />
          <h2 className="font-title text-sm font-bold text-amber-200">
            Parcela ({parcel.x}, {parcel.y})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-100 p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Terrain & Ownership */}
      <div className="text-xs space-y-1 bg-stone-950/50 p-2.5 rounded border border-stone-800">
        <div className="flex justify-between">
          <span className="text-stone-400">Teren:</span>
          <span className="font-semibold text-stone-200 capitalize">{parcel.terrain}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Statut Proprietate:</span>
          <span className="font-semibold text-amber-300">
            {parcel.ownerAccountId === 'public_town_trust' ? 'Domeniu Public' :
             parcel.ownerAccountId ? parcel.ownerAccountId : 'Liberă (Revendicabilă)'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1">
          <Shield className="w-3 h-3 text-sky-400 inline" />
          <span>Proprietate exclusiv virtuală în joc (STP-008)</span>
        </div>
      </div>

      {/* Existing Building Info */}
      {buildingDef ? (
        <div className="bg-stone-950/60 p-3 rounded border border-amber-900/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-title text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-400" />
              {buildingDef.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/40">
              Nivelul {parcel.level}
            </span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            {buildingDef.description}
          </p>

          <div className="flex gap-2 pt-2">
            {parcel.level < 3 && (
              <button
                onClick={() => onUpgrade(parcel.x, parcel.y)}
                className="frontier-button flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1"
                title="Modernizează clădirea la următorul nivel"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                Modernizează
              </button>
            )}
            <button
              onClick={() => onDemolish(parcel.x, parcel.y)}
              className="frontier-button px-3 py-1.5 rounded text-xs text-rose-400 flex items-center justify-center gap-1"
              title="Demolează clădirea"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {parcel.ownerAccountId === null && parcel.terrain !== 'water' && (
            <button
              onClick={() => onClaim(parcel.x, parcel.y)}
              disabled={availableCredits < PARCEL_BASE_PRICE_CREDITS}
              className="frontier-button w-full py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 text-amber-300"
            >
              <Coins className="w-4 h-4 text-yellow-400" />
              Cumpără Parcela ({PARCEL_BASE_PRICE_CREDITS} credite)
            </button>
          )}

          <div className="text-xs font-semibold text-stone-300 pt-1">Construiește o facilitate:</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(['house', 'farm', 'well', 'road', 'warehouse', 'school', 'workshop', 'clinic', 'guard_post'] as BuildingType[]).map(bType => {
              const def = BUILDING_DEFINITIONS[bType];
              const canAfford = availableMaterials >= def.materials && availableCredits >= def.virtualCredits;
              return (
                <button
                  key={bType}
                  onClick={() => onBuild(parcel.x, parcel.y, bType)}
                  disabled={!canAfford}
                  className="frontier-button p-2 rounded text-[11px] text-left flex flex-col justify-between"
                >
                  <span className="font-semibold text-stone-100">{def.name}</span>
                  <span className="text-[9px] text-stone-400 mt-1">{def.materials}m • {def.virtualCredits}c</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
