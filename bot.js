// bot.js — SMP PvP bots (lite version)
// - Không pathfinder, không mineflayer-pvp (đỡ lag)
// - Vào là /kit smp
// - Đứng yên, thấy người chơi nào lại gần thì quay mặt + đánh
// - Chết → respawn → /kit smp → đánh tiếp

const mineflayer = require('mineflayer')

// ===== CONFIG SERVER =====
const SERVER_HOST = process.env.SERVER_HOST || 'node1.lumine.asia'
const SERVER_PORT = Number(process.env.SERVER_PORT || 25675)
const AUTH_MODE = 'offline'          // server crack thì để offline
const SERVER_VERSION = '1.21.4'      // đúng version server của bạn

// ===== SETTINGS =====
const MAX_BOTS = 15                  // ⚠️ BẮT ĐẦU 15 CON THÔI
const JOIN_DELAY = 5000              // 5s mỗi bot cho an toàn

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

function sleep (ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ===== KIT =====
function giveKit (bot) {
  setTimeout(() => {
    try { bot.chat('/kit smp') } catch {}
  }, 2000)
}

// ===== SIMPLE COMBAT (rất nhẹ, không pathfinder) =====
function setupSimpleCombat (bot) {
  setInterval(async () => {
    if (!bot.entity || bot.health <= 0) return

    // Tìm player gần nhất
    const target = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.username !== bot.username
    )

    if (!target) return

    // Chỉ đánh nếu trong phạm vi ~4 block
    const dist = bot.entity.position.distanceTo(target.position)
    if (dist > 4) return

    try {
      // Quay mặt vào người ta
      await bot.lookAt(target.position.offset(0, 1.6, 0), true)
      // Vung tay đánh
      bot.attack(target)
    } catch (e) {
      // bỏ qua lỗi nhỏ
    }
  }, 600) // ~1.6 hit/s cho đỡ dính anti-cheat, đỡ lag
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

  bot.on('spawn', () => {
    console.log(`[${name}] spawned`)
    giveKit(bot)
  })

  bot.on('respawn', () => {
    console.log(`[${name}] respawn`)
    giveKit(bot)
  })

  bot.on('death', () => {
    console.log(`[${name}] died → respawn soon`)
    setTimeout(() => {
      try { bot.respawn() } catch {}
    }, 2000)
  })

  setupSimpleCombat(bot)

  bot.on('kicked', r => console.log(`[${name}] kicked:`, r))
  bot.on('error', e => console.log(`[${name}] error:`, e))

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
