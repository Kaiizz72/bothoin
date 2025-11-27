// bot.js MP PvP Bots LITE (STABLE FINAL)
// ✅ Không pathfinder, không mineflayer-pvp (siêu nhẹ)
// ✅ FIX crash chat 1.21.x (unknown chat format code)
// ✅ Auto /kit smp
// ✅ Đứng yên, player lại gần thì quay mặt + đánh
// ✅ Chết → respawn → /kit smp → đánh tiếp

const mineflayer = require('mineflayer')

// ===== CONFIG SERVER =====
const SERVER_HOST = process.env.SERVER_HOST || 'node1.lumine.asia'
const SERVER_PORT = Number(process.env.SERVER_PORT || 25675)
const AUTH_MODE = 'offline'
const SERVER_VERSION = '1.20'

// ===== SETTINGS =====
const MAX_BOTS = 12         // ⚠️ 10–12 con cho điện thoại / GitHub
const JOIN_DELAY = 6000     // 6 giây mỗi bot (tránh spam connect)

// ===== BOT NAMES =====
const NAMES = [
  'CuongCute','BaoDepTrai','LinhXinh','AnhHungVN','ThanhNienVN',
  'NoobViet','ProViet','VietGamer','BaoKing','HuyLegend',
  'PhongSky','MinhDark','KietFire','ZenoVN','KenjiVN',
  'DarkBoyVN','LazyCatVN','TryHarder','SnowAngel','NightWolf'
].slice(0, MAX_BOTS)

function sleep (ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ===== /KIT =====
function giveKit (bot) {
  setTimeout(() => {
    try { bot.chat('/kit smp') } catch {}
  }, 2500)
}

// ===== COMBAT AI (SIÊU NHẸ) =====
function setupCombat (bot) {
  setInterval(async () => {
    if (!bot.entity || bot.health <= 0) return

    const target = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.username !== bot.username
    )

    if (!target) return

    const dist = bot.entity.position.distanceTo(target.position)
    if (dist > 4) return

    try {
      await bot.lookAt(target.position.offset(0, 1.6, 0), true)
      bot.attack(target)
    } catch {}
  }, 700) // ~1.4 hit/s – rất an toàn
}

// ===== CREATE BOT =====
function createBot (name) {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: name,
    auth: AUTH_MODE,
    version: SERVER_VERSION
  })

  // ✅ FIX CRASH CHAT 1.21.x (QUAN TRỌNG)
  bot._client.on('chat', () => {})
  bot._client.on('system_chat', () => {})
  bot._client.on('player_chat', () => {})

  bot.on('spawn', () => {
    console.log(`[${name}] spawned`)
    giveKit(bot)
  })

  bot.on('respawn', () => {
    console.log(`[${name}] respawn`)
    giveKit(bot)
  })

  bot.on('death', () => {
    console.log(`[${name}] died`)
    setTimeout(() => {
      try { bot.respawn() } catch {}
    }, 2000)
  })

  setupCombat(bot)

  bot.on('kicked', r => console.log(`[${name}] kicked`))
  bot.on('error', e => console.log(`[${name}] error`))

  return bot
}

// ===== START =====
;(async () => {
  for (const name of NAMES) {
    console.log(`Creating bot ${name}...`)
    createBot(name)
    await sleep(JOIN_DELAY)
  }
})()
