import { baseTrait, BASES, campDebug, campLabel, inTerr, spearN, TRAITS } from '../ai/kingdoms.js';
import { evChoose, eventsState, eventsTick, evPush, renownMul, resolveEvent0 } from '../gameplay/events.js';
import { bossStomp } from '../ai/wave-boss.js';
import { RHAS, roleAdj0 } from '../ai/worker-roles.js';
import { forester, SAPL } from '../ai/workplaces.js';
import { PUD, SCRT } from '../ai/zombies.js';
import { dist } from '../core/math.js';
import { CHK as BCHK, buildChunk as bBuildChunk, updateChunks as bUpdateChunks } from '../rendering/terrain.js';
import { buildProps as bBuildProps } from '../rendering/terrain-props.js';
import { blocksState, BSEAS, setBlocks, setSeasons } from '../rendering/blocks.js';
import { rngf } from '../core/random.js';
import { GVER } from '../core/version.js';
import { diagnosticsState, ERRLOG } from './diagnostics.js';
import { bugReport, devAct, devToggle } from './tools.js';
import { ach, ACH } from '../gameplay/achievements.js';
import { build, constructionState, setBuildHandler, tilesFor, valid } from '../gameplay/construction.js';
import { buy, economyState, FAT, PBASE, PRICE, priceTick, setTrainHandler, train } from '../gameplay/economy.js';
import { mkU, spawnPos } from '../gameplay/entities.js';
import { wavePreview } from '../gameplay/wave-preview.js';
import { formationsState, order, setOrderHandler } from '../gameplay/formations.js';
import { kingOf, kingSkill, kingTalent, kingSkill0, kingTick, kskLeft, kingXp, kingTalent0, kxLevel, kPoints, kHas, KXL } from '../gameplay/king-skills.js';
import { openMenu, quitGame, setStartGameHandler, startGame } from '../gameplay/lifecycle.js';
import { LPL, playersState, setPl, setTier } from '../gameplay/players.js';
import { reset } from '../gameplay/reset.js';
import { C, LH, RS, RS2, RT2, rulesState, rxLock, T, TRAIN, TS, TW, UPC } from '../gameplay/rules.js';
import { selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { simulationState } from '../gameplay/simulation.js';
import { gstBest, sbRec, setUpdateHandler, statisticsState, update } from '../gameplay/statistics.js';
import { SW, swarmState, SWD } from '../gameplay/swarm.js';
import { laneFieldQ, LFLD } from '../ai/zombie-lanes.js';
import { callWave, restT, setCallWaveHandler, wave, wavesState } from '../gameplay/waves.js';
import { _N, mpExec, mpPush, questSwitch, roleAdj, sendConvoy, setMpExecHandler } from '../multiplayer/commands.js';
import { convoyLinked, convoyStep, setConvoyStepHandler } from '../multiplayer/convoys.js';
import { mpStart, mpWorldSync } from '../multiplayer/lobby.js';
import { mpHash, mpMsg, setMpMsgHandler } from '../multiplayer/lockstep.js';
import { objTick, SPK } from '../multiplayer/objectives.js';
import { qCur, qFix, QUESTS, questsState } from '../gameplay/quests.js';
import { questPanelState } from '../ui/quest-panel.js';
import { tabState } from '../ui/build-menu.js';
import { MP } from '../multiplayer/session.js';
import { svApply } from '../persistence/restore.js';
import { SAVA, svAssign, svPack } from '../persistence/save-format.js';
import { continueLast, saveMenuState, svPeek } from '../ui/save-menu.js';
import { bannerIcon } from '../rendering/banner-icon.js';
import { drawBanner } from '../rendering/kingdom-banner.js';
import { THEME } from '../ui/kingdom-theme.js';
import { NAV } from '../ui/menu-nav.js';
import { KB, loadKB, settingsDebug, settingsState } from '../ui/settings.js';
import { titleDebug } from '../ui/title-menu.js';
import { guideState, guideWatch, openGuide } from '../ui/video-guide.js';
import { languageState } from '../i18n/language.js';
import { FOWU } from '../rendering/fog.js';
import { render3D, setRender3DHandler } from '../rendering/frame.js';
import { matV } from '../rendering/materials.js';
import { icoUnit } from '../rendering/model-icons.js';
import { icoPart } from '../rendering/pixel-icons.js';
import { shieldGeo } from '../rendering/models/heraldry.js';
import { sGeo } from '../rendering/models/structures.js';
import { toolGeos } from '../rendering/models/unit-parts.js';
import { ZNV } from '../rendering/models/zombies.js';
import { rs } from '../rendering/resolution.js';
import { CAM, hemi, renderer, scene, sun } from '../rendering/scene.js';
import { buildStructMesh, setBuildStructMeshHandler } from '../rendering/structures.js';
import { unitG } from '../rendering/terrain.js';
import { animUnit } from '../rendering/unit-animation.js';
import { nightK } from '../rendering/lighting.js';
import { matUI } from '../rendering/unit-instances.js';
import { seasonIdx, weatherTick, WX, wxKind, wxLabel } from '../rendering/weather.js';
import { cv } from '../ui/canvases.js';
import { convoyPanelState, CVA } from '../ui/convoy-panel.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { inputState } from '../input/state.js';
import { drawUI, hudState } from '../ui/hud.js';
import {
  buildPreview,
  confirmPick,
  openPicker,
  randomSite,
  setConfirmPickHandler,
  sitePickerState,
} from '../ui/site-picker.js';
import { FD, gOK } from '../world/routes.js';
import {
  HT,
  occ,
  pth,
  rollWorld,
  RUINS,
  ensureAround,
  setRollWorldHandler,
  stairs,
  starterTiles,
  ter,
  terrainState,
  TFL,
} from '../world/terrain.js';
import { bfsW, canStep, canStepZ, freeTile, fv, solid } from '../world/traversal.js';

// Browser automation and the in-repo preview tools evaluate these names in the page.
// Gameplay code uses imports and never reads through this console interface.
export function installBrowserConsole() {
  const bindings = {
    ACH: { get: () => ACH },
    CAM: { get: () => CAM },
    CS: { get: () => sessionState.CS, set: value => { sessionState.CS = value; } },
    CS2: { get: () => sessionState.CS2, set: value => { sessionState.CS2 = value; } },
    CURPL: { get: () => playersState.CURPL, set: value => { playersState.CURPL = value; } },
    CVA: { get: () => CVA },
    CX: { get: () => terrainState.CX, set: value => { terrainState.CX = value; } },
    CY: { get: () => terrainState.CY, set: value => { terrainState.CY = value; } },
    DEVU: { get: () => diagnosticsState.DEVU, set: value => { diagnosticsState.DEVU = value; } },
    ERRLOG: { get: () => ERRLOG },
    FGS: { get: () => formationsState.FGS, set: value => { formationsState.FGS = value; } },
    FORCEF: { get: () => formationsState.FORCEF, set: value => { formationsState.FORCEF = value; } },
    FOWU: { get: () => FOWU },
    GPR: { get: () => terrainState.GPR, set: value => { terrainState.GPR = value; } },
    GST: { get: () => rulesState.GST, set: value => { rulesState.GST = value; } },
    GVER: { get: () => GVER },
    HT: { get: () => HT },
    LH: { get: () => LH },
    LPL: { get: () => LPL },
    MP: { get: () => MP },
    OBJ: { get: () => statisticsState.OBJ, set: value => { statisticsState.OBJ = value; } },
    PRICE: { get: () => PRICE },
    FAT: { get: () => FAT },
    PBASE: { get: () => PBASE },
    priceTick: { get: () => priceTick },
    economyState: { get: () => economyState },
    rxLock: { get: () => rxLock },
    PUD: { get: () => PUD },
    RESP: { get: () => playersState.RESP, set: value => { playersState.RESP = value; } },
    RHAS: { get: () => RHAS },
    ROUTES: { get: () => terrainState.ROUTES, set: value => { terrainState.ROUTES = value; } },
    RS: { get: () => RS },
    RS2: { get: () => RS2 },
    RT2: { get: () => RT2 },
    SAPL: { get: () => SAPL },
    SAVA: { get: () => SAVA },
    SBR: { get: () => statisticsState.SBR, set: value => { statisticsState.SBR = value; } },
    SCRT: { get: () => SCRT },
    SEED: { get: () => terrainState.SEED, set: value => { terrainState.SEED = value; } },
    SITE2: { get: () => sessionState.SITE2, set: value => { sessionState.SITE2 = value; } },
    SPK: { get: () => SPK },
    QST: { get: () => questsState.Q, set: value => { questsState.Q = value; } },
    QUESTS: { get: () => QUESTS },
    questSwitch: { get: () => questSwitch },
    qCur: { get: () => qCur },
    qFix: { get: () => qFix },
    questPanelState: { get: () => questPanelState },
    tabState: { get: () => tabState },
    SW: { get: () => SW },
    T: { get: () => T },
    TFL: { get: () => TFL },
    TRAIN: { get: () => TRAIN },
    TS: { get: () => TS },
    TW: { get: () => TW },
    RUINS: { get: () => RUINS },
    BASES: { get: () => BASES },
    C: { get: () => C },
    ensureAround: { get: () => ensureAround },
    hudDisplayState: { get: () => hudDisplayState },
    inputState: { get: () => inputState },
    hudState: { get: () => hudState },
    UPC: { get: () => UPC },
    WX: { get: () => WX },
    ZNV: { get: () => ZNV },
    _N: { get: () => _N },
    ach: { get: () => ach },
    animUnit: { get: () => animUnit },
    bossStomp: { get: () => bossStomp },
    bugReport: { get: () => bugReport },
    build: { get: () => build, set: setBuildHandler },
    buildPreview: { get: () => buildPreview },
    buildStructMesh: { get: () => buildStructMesh, set: setBuildStructMeshHandler },
    buy: { get: () => buy },
    wavePreview: { get: () => wavePreview },
    callWave: { get: () => callWave, set: setCallWaveHandler },
    confirmPick: { get: () => confirmPick, set: setConfirmPickHandler },
    convoyOpen: { get: () => convoyPanelState.convoyOpen, set: value => { convoyPanelState.convoyOpen = value; } },
    convoyStep: { get: () => convoyStep, set: setConvoyStepHandler },
    cv: { get: () => cv },
    devAct: { get: () => devAct },
    devOpen: { get: () => diagnosticsState.devOpen, set: value => { diagnosticsState.devOpen = value; } },
    devToggle: { get: () => devToggle },
    dist: { get: () => dist },
    forester: { get: () => forester },
    formType: { get: () => constructionState.formType, set: value => { constructionState.formType = value; } },
    bfsW: { get: () => bfsW },
    swDbg: { get: () => ({ FD, swarmState, SWD, laneFieldQ, LFLD, fv, canStep, canStepZ, solid, wavesState }) },
    freeTile: { get: () => freeTile },
    gOK: { get: () => gOK },
    gstBest: { get: () => gstBest },
    hordeOn: { get: () => wavesState.hordeOn, set: value => { wavesState.hordeOn = value; } },
    hordeT: { get: () => wavesState.hordeT, set: value => { wavesState.hordeT = value; } },
    icoUnit: { get: () => icoUnit },
    inGame: { get: () => sessionState.inGame, set: value => { sessionState.inGame = value; } },
    inTerr: { get: () => inTerr },
    kills: { get: () => sessionState.kills, set: value => { sessionState.kills = value; } },
    kingOf: { get: () => kingOf },
    kingSkill0: { get: () => kingSkill0 },
    kingTick: { get: () => kingTick },
    kingXp: { get: () => kingXp },
    kingSkill: { get: () => kingSkill },
    kingTalent: { get: () => kingTalent },
    kingTalent0: { get: () => kingTalent0 },
    kxLevel: { get: () => kxLevel },
    kPoints: { get: () => kPoints },
    kHas: { get: () => kHas },
    KXL: { get: () => KXL },
    EVS: { get: () => eventsState },
    evChoose: { get: () => evChoose },
    evPush: { get: () => evPush },
    eventsTick: { get: () => eventsTick },
    resolveEvent0: { get: () => resolveEvent0 },
    renownMul: { get: () => renownMul },
    baseTrait: { get: () => baseTrait },
    campLabel: { get: () => campLabel },
    TRAITS: { get: () => TRAITS },
    spearN: { get: () => spearN },
    campDebug: { get: () => campDebug },
    KB: { get: () => KB },
    loadKB: { get: () => loadKB },
    kskLeft: { get: () => kskLeft },
    matUI: { get: () => matUI },
    matV: { get: () => matV },
    mkU: { get: () => mkU },
    mode: { get: () => sessionState.mode, set: value => { sessionState.mode = value; } },
    mpExec: { get: () => mpExec, set: setMpExecHandler },
    mpHash: { get: () => mpHash },
    mpMsg: { get: () => mpMsg, set: setMpMsgHandler },
    mpPush: { get: () => mpPush },
    mpStart: { get: () => mpStart },
    mpWorldSync: { get: () => mpWorldSync },
    msgS: { get: () => hudDisplayState.msgS, set: value => { hudDisplayState.msgS = value; } },
    nextL: { get: () => sessionState.nextL, set: value => { sessionState.nextL = value; } },
    nightK: { get: () => nightK },
    nightLv: { get: () => wavesState.nightLv, set: value => { wavesState.nightLv = value; } },
    objTick: { get: () => objTick },
    occ: { get: () => occ },
    order: { get: () => order, set: setOrderHandler },
    over: { get: () => sessionState.over, set: value => { sessionState.over = value; } },
    paused: { get: () => sessionState.paused, set: value => { sessionState.paused = value; } },
    pickPos: { get: () => sitePickerState.pickPos, set: value => { sitePickerState.pickPos = value; } },
    pth: { get: () => pth },
    pvKey: { get: () => sitePickerState.pvKey, set: value => { sitePickerState.pvKey = value; } },
    queue: { get: () => sessionState.queue, set: value => { sessionState.queue = value; } },
    randomSite: { get: () => randomSite },
    render3D: { get: () => render3D, set: setRender3DHandler },
    renderer: { get: () => renderer },
    res: { get: () => sessionState.res, set: value => { sessionState.res = value; } },
    reset: { get: () => reset },
    restT: { get: () => restT },
    rngf: { get: () => rngf },
    roleAdj: { get: () => roleAdj },
    roleAdj0: { get: () => roleAdj0 },
    rollWorld: { get: () => rollWorld, set: setRollWorldHandler },
    rs: { get: () => rs },
    sGeo: { get: () => sGeo },
    sbRec: { get: () => sbRec },
    scene: { get: () => scene },
    sun: { get: () => sun },
    hemi: { get: () => hemi },
    seasonIdx: { get: () => seasonIdx },
    selB: { get: () => selectionState.selB, set: value => { selectionState.selB = value; } },
    sendConvoy: { get: () => sendConvoy },
    setPl: { get: () => setPl },
    setTier: { get: () => setTier },
    shelOn: { get: () => simulationState.shelOn, set: value => { simulationState.shelOn = value; } },
    shieldGeo: { get: () => shieldGeo },
    spawnPos: { get: () => spawnPos },
    spd: { get: () => sessionState.spd, set: value => { sessionState.spd = value; } },
    stairs: { get: () => stairs },
    startGame: { get: () => startGame, set: setStartGameHandler },
    started: { get: () => sessionState.started, set: value => { sessionState.started = value; } },
    starterTiles: { get: () => starterTiles },
    structs: { get: () => sessionState.structs, set: value => { sessionState.structs = value; } },
    svApply: { get: () => svApply },
    svAssign: { get: () => svAssign },
    svPack: { get: () => svPack },
    saveMenuState: { get: () => saveMenuState },
    NAV: { get: () => NAV },
    settingsDebug: { get: () => settingsDebug },
    settingsState: { get: () => settingsState },
    THEME: { get: () => THEME },
    drawBanner: { get: () => drawBanner },
    bannerIcon: { get: () => bannerIcon },
    titleDebug: { get: () => titleDebug },
    guideState: { get: () => guideState },
    openGuide: { get: () => openGuide },
    guideWatch: { get: () => guideWatch },
    openMenu: { get: () => openMenu },
    quitGame: { get: () => quitGame },
    drawUI: { get: () => drawUI },
    convoyLinked: { get: () => convoyLinked },
    icoPart: { get: () => icoPart },
    openPicker: { get: () => openPicker },
    sitePickerState: { get: () => sitePickerState },
    languageState: { get: () => languageState },
    svPeek: { get: () => svPeek },
    continueLast: { get: () => continueLast },
    ter: { get: () => ter },
    setBlocks: { get: () => setBlocks },
    blkChunks: { get: () => ({ CHK: BCHK, buildChunk: bBuildChunk, buildProps: bBuildProps, updateChunks: bUpdateChunks }) },
    blocksState: { get: () => blocksState },
    BSEAS: { get: () => BSEAS },
    setSeasons: { get: () => setSeasons },
    tilesFor: { get: () => tilesFor },
    time: { get: () => sessionState.time, set: value => { sessionState.time = value; } },
    toolGeos: { get: () => toolGeos },
    train: { get: () => train, set: setTrainHandler },
    unitG: { get: () => unitG },
    units: { get: () => sessionState.units, set: value => { sessionState.units = value; } },
    update: { get: () => update, set: setUpdateHandler },
    valid: { get: () => valid },
    ver: { get: () => sessionState.ver, set: value => { sessionState.ver = value; } },
    wave: { get: () => wave },
    waveN: { get: () => sessionState.waveN, set: value => { sessionState.waveN = value; } },
    waveOn: { get: () => wavesState.waveOn, set: value => { wavesState.waveOn = value; } },
    waveST: { get: () => wavesState.waveST, set: value => { wavesState.waveST = value; } },
    waveT: { get: () => sessionState.waveT, set: value => { sessionState.waveT = value; } },
    weatherTick: { get: () => weatherTick },
    wxKind: { get: () => wxKind },
    wxLabel: { get: () => wxLabel },
  };
  for (const descriptor of Object.values(bindings)) descriptor.configurable = true;
  Object.defineProperties(globalThis, bindings);
}
