import { initializeAutosave } from "./gameplay/autosave.js";
import { initializeWorkplaces } from "./ai/workplaces.js";
import { initializeZombieLanes } from "./ai/zombie-lanes.js";
import { initializeSound } from "./audio/sound.js";
import { initializeBackgroundLoop } from "./core/background-loop.js";
import { initializeFrameLoop, startFrameLoop, warmFrame } from "./core/frame-loop.js";
import { initializeRandom } from "./core/random.js";
import { installBrowserConsole } from "./debug/browser-console.js";
import { initializeDiagnostics } from "./debug/diagnostics.js";
import { initializeConstruction } from "./gameplay/construction.js";
import { initializeEconomy } from "./gameplay/economy.js";
import { initializeRules } from "./gameplay/rules.js";
import { initializeSessionPreferences } from "./gameplay/session.js";
import { initializeSpatialIndex } from "./gameplay/spatial-index.js";
import { initializeSwarm } from "./gameplay/swarm.js";
import { initializeTraps } from "./gameplay/traps.js";
import { initializeLanguage, initializeTranslationLookup } from "./i18n/language.js";
import { initializeTranslations } from "./i18n/translations.js";
import { initializeControlGroups } from "./input/control-groups.js";
import { initializeDesktopInput } from "./input/desktop.js";
import { initializeBuildShortcuts, initializeShortcuts } from "./input/shortcuts.js";
import { initializeTouch } from "./input/touch.js";
import { initializeChat, initializeChatMessages } from "./multiplayer/chat.js";
import { initializeCommands } from "./multiplayer/commands.js";
import { initializeConnection } from "./multiplayer/connection.js";
import { initializeLobby, initializeLobbyState } from "./multiplayer/lobby.js";
import { initializeLockstep, initializeMultiplayerFrame } from "./multiplayer/lockstep.js";
import { initializePings } from "./multiplayer/pings.js";
import { initializeResync } from "./multiplayer/resync.js";
import { initializeSitePreview } from "./multiplayer/site-preview.js";
import { initializeBuildPreview } from "./rendering/build-preview.js";
import { initializeCamera } from "./rendering/camera.js";
import { initializeEffects, initializeWorldEffects } from "./rendering/effects.js";
import { initializeFog, initializeFogOverlay } from "./rendering/fog.js";
import { initializeKingdomBanner } from "./rendering/kingdom-banner.js";
import { initializeSceneLighting } from "./rendering/lighting.js";
import { initializeBlocks } from "./rendering/blocks.js";
import { initializeMaterials, initializeTerrainMaterial } from "./rendering/materials.js";
import { initializeBuildingParts } from "./rendering/models/building-parts.js";
import { initializePixelGeometry } from "./rendering/models/pixel-geometry.js";
import { initializeRoyalSkins } from "./rendering/models/royal-skins.js";
import { initializeSoldierSkins } from "./rendering/models/soldier-skins.js";
import { initializeStructureModels } from "./rendering/models/structures.js";
import { initializeSwarmModels } from "./rendering/models/swarm.js";
import { initializeUnits } from "./rendering/models/units.js";
import { initializeWeapons } from "./rendering/models/weapons.js";
import { initializePixelIcons } from "./rendering/pixel-icons.js";
import { initializePostProcessing } from "./rendering/post-processing.js";
import { initializeRoutes } from "./rendering/routes.js";
import { initializeScene } from "./rendering/scene.js";
import { initializeSitePicker } from "./rendering/site-picker.js";
import { initializeStructures } from "./rendering/structures.js";
import { initializeSwarmRendering } from "./rendering/swarm.js";
import { initializeTerrainRendering } from "./rendering/terrain.js";
import { initializeTerrainProps } from "./rendering/terrain-props.js";
import { initializeTitleScene, prepTitle } from "./rendering/title-scene.js";
import { initializeUnitInstances } from "./rendering/unit-instances.js";
import { initializeWeather } from "./rendering/weather.js";
import { initializeBuildMenu } from "./ui/build-menu.js";
import { initializeCanvases } from "./ui/canvases.js";
import { initializeAdditionalIcons, initializeBuildingIcons, initializeIcons } from "./ui/icons.js";
import { initializeKingdomTheme } from "./ui/kingdom-theme.js";
import { initializeMinimapDisplay } from "./ui/minimap.js";
import { initializeClaudeIntro, playClaudeIntro } from "./ui/intro-claude.js";
import { initializeSaveMenu } from "./ui/save-menu.js";
import { initializeSettings } from "./ui/settings.js";
import { initializeMenuNav } from "./ui/menu-nav.js";
import { initializeSitePickerMenu } from "./ui/site-picker.js";
import { initializeTypography } from "./ui/typography.js";
import { initializeTerrain } from "./world/terrain.js";

import { runBoot } from "./core/boot.js";

// Start-up steps, in order: canvas and simulation data, then materials and models, then title, menus and input,
// then the registrations the first animation callback needs. core/boot.js runs them in slices so the launch
// cards (index.html, styles/boot.css) keep animating, and starts the frame loop when the intro is over.
runBoot(
  [
    initializeRandom,
    initializeDiagnostics,
    initializeCanvases,
    initializeRules,
    initializeTerrain,
    initializeSessionPreferences,
    initializeKingdomTheme,
    initializeConstruction,
    initializeEconomy,
    initializeSpatialIndex,
    initializeWorkplaces,
    initializeZombieLanes,
    initializeSwarm,
    initializeScene,
    initializeBlocks,
    initializeMaterials,
    initializeTerrainRendering,
    initializeTerrainProps,
    initializeFog,
    initializeTerrainMaterial,
    initializeFogOverlay,
    initializePixelGeometry,
    initializeSoldierSkins,
    initializeWeapons,
    initializeRoyalSkins,
    initializeUnits,
    initializeSwarmModels,
    initializeUnitInstances,
    initializeStructureModels,
    initializeStructures,
    initializeBuildingParts,
    initializeEffects,
    initializeCamera,
    initializeBuildPreview,
    initializeWorldEffects,
    initializeSwarmRendering,
    initializeRoutes,
    initializeSceneLighting,
    initializePostProcessing,
    initializeSound,
    initializeTitleScene,
    initializeSitePicker,
    initializeTypography,
    initializeLanguage,
    initializeTranslations,
    initializeTranslationLookup,
    initializeIcons,
    initializeKingdomBanner,
    initializeMinimapDisplay,
    initializeBuildMenu,
    initializeSitePickerMenu,
    initializeSettings,
    initializeMenuNav,
    initializeDesktopInput,
    initializeFrameLoop,
    initializeLockstep,
    initializeCommands,
    initializeResync,
    initializeMultiplayerFrame,
    initializeLobbyState,
    initializeConnection,
    initializeLobby,
    initializeAdditionalIcons,
    initializeControlGroups,
    initializeShortcuts,
    initializeChat,
    initializePings,
    initializeAutosave,
    initializeChatMessages,
    initializeSitePreview,
    initializeBuildingIcons,
    initializeBackgroundLoop,
    initializeBuildShortcuts,
    initializePixelIcons,
    initializeClaudeIntro,
    initializeSaveMenu,
    initializeWeather,
    initializeTraps,
    initializeTouch,
    installBrowserConsole,
  ],
  { firstGl: initializeScene, prepTitle, warmFrame, startFrameLoop, playClaude: playClaudeIntro },
);
