import React from 'react';
import { BuildingType, BUILDING_DEFINITIONS, PARCEL_BASE_PRICE_CREDITS } from '@stupul/engine';
import { 
  Home, 
  Tractor, 
  Droplet, 
  Footprints, 
  Warehouse, 
  GraduationCap, 
  Wrench, 
  HeartPulse, 
  ShieldAlert, 
  ArrowUpCircle, 
  Trash2, 
  MapPinPlus 
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.js';

export type BuildTool = BuildingType | 'claim' | 'demolish' | 'upgrade' | null;

interface BuildToolbarProps {
  activeTool: BuildTool;
  onSelectTool: (tool: BuildTool) => void;
  availableMaterials: number;
  availableCredits: number;
}

export const BuildToolbar: React.FC<BuildToolbarProps> = ({
  activeTool,
  onSelectTool,
  availableMaterials,
  availableCredits
}) => {
  const { tData } = useLanguage();

  const tools: Array<{
    id: BuildTool;
    name: string;
    icon: React.ReactNode;
    costText: string;
    canAfford: boolean;
  }> = [
    {
      id: 'house',
      name: tData.tools.house,
      icon: <Home className="w-4 h-4 text-amber-200" />,
      costText: `${BUILDING_DEFINITIONS.house.materials}m • ${BUILDING_DEFINITIONS.house.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.house.materials && availableCredits >= BUILDING_DEFINITIONS.house.virtualCredits
    },
    {
      id: 'farm',
      name: tData.tools.farm,
      icon: <Tractor className="w-4 h-4 text-yellow-300" />,
      costText: `${BUILDING_DEFINITIONS.farm.materials}m • ${BUILDING_DEFINITIONS.farm.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.farm.materials && availableCredits >= BUILDING_DEFINITIONS.farm.virtualCredits
    },
    {
      id: 'well',
      name: tData.tools.well,
      icon: <Droplet className="w-4 h-4 text-sky-400" />,
      costText: `${BUILDING_DEFINITIONS.well.materials}m • ${BUILDING_DEFINITIONS.well.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.well.materials && availableCredits >= BUILDING_DEFINITIONS.well.virtualCredits
    },
    {
      id: 'road',
      name: tData.tools.road,
      icon: <Footprints className="w-4 h-4 text-stone-300" />,
      costText: `${BUILDING_DEFINITIONS.road.materials}m • ${BUILDING_DEFINITIONS.road.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.road.materials && availableCredits >= BUILDING_DEFINITIONS.road.virtualCredits
    },
    {
      id: 'warehouse',
      name: tData.tools.warehouse,
      icon: <Warehouse className="w-4 h-4 text-orange-300" />,
      costText: `${BUILDING_DEFINITIONS.warehouse.materials}m • ${BUILDING_DEFINITIONS.warehouse.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.warehouse.materials && availableCredits >= BUILDING_DEFINITIONS.warehouse.virtualCredits
    },
    {
      id: 'school',
      name: tData.tools.school,
      icon: <GraduationCap className="w-4 h-4 text-indigo-300" />,
      costText: `${BUILDING_DEFINITIONS.school.materials}m • ${BUILDING_DEFINITIONS.school.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.school.materials && availableCredits >= BUILDING_DEFINITIONS.school.virtualCredits
    },
    {
      id: 'workshop',
      name: tData.tools.workshop,
      icon: <Wrench className="w-4 h-4 text-amber-500" />,
      costText: `${BUILDING_DEFINITIONS.workshop.materials}m • ${BUILDING_DEFINITIONS.workshop.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.workshop.materials && availableCredits >= BUILDING_DEFINITIONS.workshop.virtualCredits
    },
    {
      id: 'clinic',
      name: tData.tools.clinic,
      icon: <HeartPulse className="w-4 h-4 text-rose-400" />,
      costText: `${BUILDING_DEFINITIONS.clinic.materials}m • ${BUILDING_DEFINITIONS.clinic.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.clinic.materials && availableCredits >= BUILDING_DEFINITIONS.clinic.virtualCredits
    },
    {
      id: 'guard_post',
      name: tData.tools.guard_post,
      icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
      costText: `${BUILDING_DEFINITIONS.guard_post.materials}m • ${BUILDING_DEFINITIONS.guard_post.virtualCredits}c`,
      canAfford: availableMaterials >= BUILDING_DEFINITIONS.guard_post.materials && availableCredits >= BUILDING_DEFINITIONS.guard_post.virtualCredits
    },
    {
      id: 'upgrade',
      name: tData.tools.upgrade,
      icon: <ArrowUpCircle className="w-4 h-4 text-emerald-300" />,
      costText: tData.tools.upgrade,
      canAfford: true
    },
    {
      id: 'demolish',
      name: tData.tools.demolish,
      icon: <Trash2 className="w-4 h-4 text-rose-500" />,
      costText: tData.tools.demolish,
      canAfford: true
    },
    {
      id: 'claim',
      name: tData.tools.claim,
      icon: <MapPinPlus className="w-4 h-4 text-yellow-400" />,
      costText: `${PARCEL_BASE_PRICE_CREDITS} ${tData.tools.creditsCost}`,
      canAfford: availableCredits >= PARCEL_BASE_PRICE_CREDITS
    }
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 frontier-panel rounded-lg p-1.5 flex items-center gap-1.5 z-10 max-w-[95vw] overflow-x-auto shadow-2xl">
      {tools.map(tool => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onSelectTool(isActive ? null : tool.id)}
            className={`px-2.5 py-1.5 rounded flex flex-col items-center justify-center min-w-[56px] text-[10px] transition ${
              isActive
                ? 'bg-amber-600 text-stone-900 font-bold border border-amber-300 shadow-md'
                : 'hover:bg-stone-800 text-stone-200 border border-transparent'
            } ${!tool.canAfford ? 'opacity-40' : ''}`}
            title={`${tool.name} (${tool.costText})`}
          >
            {tool.icon}
            <span className="mt-0.5 whitespace-nowrap">{tool.name}</span>
            <span className="text-[9px] text-stone-400 whitespace-nowrap">{tool.costText}</span>
          </button>
        );
      })}
    </div>
  );
};
