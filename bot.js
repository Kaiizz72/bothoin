// bot.js — 40 SMP PvP bots
// - KHÔNG autoeat
// - Auto /kit smp
// - Chết → respawn → /kit smp → đánh tiếp

const mineflayer = require('mineflayer')
const { pathfinder, goals: { GoalXZ } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

// ===== CONFIG SERVER =====
const SERVER_HOST = process.env.SERVER_HOST || 'node1.lumine.asia'
const SERVER_PORT = Number(process.env.SERVER_PORT || 25675)
const AUTH_MODE = 'offline'

// ===== SETTINGS =====
const MAX_BOTS = 40
const JOIN_DELAY = 2500

// ===== BOT NAMES (Việt + English trộn) =====
const NAMES = [
  'CuongCute','BaoDepTrai','LinhXinh','AnhHungVN','ThanhNienVN',
  'NoobViet','ProViet','VietGamer','BaoKing','HuyLegend',
  'PhongSky','MinhDark','KietFire','ZenoVN','KenjiVN',
  'DarkBoyVN','SweetGirl','LazyCatVN','TryHarder','SnowAngel',
  'NightWolf','RedPandaVN','KaiVN','ZeroVN','MonkeyKing',
  'FoxCuteVN','RainyDay','SunnyVN','DragonVN','ShadowVN',
  'NhaQueVN','CuTichVN','TimNang','YasuoMain','JungleBoy',
  'MidLaneVN','TopLaneVN','Memaybel','ChaoHet','BotSMP'
].slice(0, MAX_BOTS)

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ===== GIVE KIT =====
function giveKit(bot) {
  setTimeout(() => {
    try {
      bot.chat('/kit smp')
    } catch {}
  }, 1500)
}

// ===== COMBAT AI =====
function setupCombat(bot) {
  bot.on('physicTick', () => {
    if (bot.health <= 0) return

    const target = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.username !== bot.username
    )

    if (!target) {
      if (bot.pvp.target) bot.pvp.stop()
      return
    }

    if (!bot.pvp.target || bot.pvp.target !== target) {
      bot.pvp.attack(target)
    }
  })
}

// ===== RANDOM MOVE =====
function wander(bot) {
  setInterval(() => {
    if (!bot.entity) return
    const x = bot.entity.position.x + (Math.random() * 16 - 8)
    const z = bot.entity.position.z + (Math.random() * 16 - 8)
    bot.pathfinder.setGoal(new GoalXZ(x, z), false)
  }, 12000)
}

// ===== CREATE BOT =====
function createBot(name) {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: name,
    auth: AUTH_MODE
  })

  bot.loadPlugin(pathfinder)
  bot.loadPlugin(pvp)

  bot.on('spawn', () => {
    console.log(`[${name}] joined`)
    giveKit(bot)
  })

  bot.on('respawn', () => {
    console.log(`[${name}] respawn`)
    giveKit(bot)
  })

  bot.on('death', () => {
    console.log(`[${name}] died → respawn`)
    setTimeout(() => {
      try { bot.respawn() } catch {}
    }, 2000)
  })

  setupCombat(bot)
  wander(bot)

  bot.on('kicked', r => console.log(`[${name}] kicked:`, r))
  bot.on('error', e => console.log(`[${name}] error:`, e))

  return bot
}

// ===== START =====
;(async () => {
  for (const name of NAMES) {
    createBot(name)
    await sleep(JOIN_DELAY)
  }
})()
