// bot.js — 40 SMP PvP bots (anti-kick version)
// - Auto /register + /login (nếu có auth plugin)
// - Auto /kit smp sau khi login
// - Chết → respawn → login lại → /kit smp → đánh tiếp
// - Giảm CPS + bớt di chuyển ảo để đỡ bị anti-cheat đá

const mineflayer = require('mineflayer')
const { pathfinder } = require('mineflayer-pathfinder')
const { goals: { GoalXZ } } = require('mineflayer-pathfinder') // vẫn import nếu sau này cần
const pvp = require('mineflayer-pvp').plugin

// ===== CONFIG SERVER =====
const SERVER_HOST = process.env.SERVER_HOST || 'node1.lumine.asia'
const SERVER_PORT = Number(process.env.SERVER_PORT || 25675)
const AUTH_MODE = 'offline' // server crack thì để offline

// ===== SETTINGS =====
const MAX_BOTS = 40
const JOIN_DELAY = 5000 // tăng delay join mỗi bot lên 5s cho an toàn

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

// ===== AUTH + KIT =====

// gửi /register & /login (nếu sv không dùng auth plugin thì nó sẽ bị ignore, không sao)
function authLogin(bot) {
  // đổi pass nếu bạn muốn
  const pass = '123456'

  setTimeout(() => {
    try { bot.chat(`/register ${pass} ${pass}`) } catch {}
  }, 1000)

  setTimeout(() => {
    try { bot.chat(`/login ${pass}`) } catch {}
  }, 3000)
}

// gọi /kit smp sau khi chắc chắn đã login xong
function giveKit(bot) {
  setTimeout(() => {
    try { bot.chat('/kit smp') } catch {}
  }, 5000)
}

// ===== COMBAT AI (giảm CPS, đỡ spam) =====
function setupCombat(bot) {
  // tick combat ~ mỗi 400ms (2.5 hit/s)
  setInterval(() => {
    if (!bot.entity || bot.health <= 0) return

    const target = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.username !== bot.username
    )

    if (!target) {
      if (bot.pvp.target) bot.pvp.stop()
      return
    }

    // chỉ set target khi khác hoặc chưa có
    if (!bot.pvp.target || bot.pvp.target !== target) {
      bot.pvp.attack(target)
    }
  }, 400)
}

// (KHÔNG wander random nữa để tránh motion lố)
// nếu sau này cần cho tụi nó đi dạo thì bật lại nhưng giờ tắt cho an toàn

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
    console.log(`[${name}] spawned`)
    authLogin(bot)
    giveKit(bot)
  })

  bot.on('respawn', () => {
    console.log(`[${name}] respawn`)
    // Nhiều auth plugin bắt login lại khi respawn (tùy), cứ gửi lại cho chắc
    authLogin(bot)
    giveKit(bot)
  })

  bot.on('death', () => {
    console.log(`[${name}] died → respawn soon`)
    setTimeout(() => {
      try { bot.respawn() } catch {}
    }, 2000)
  })

  setupCombat(bot)

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
