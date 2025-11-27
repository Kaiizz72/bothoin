// bot.js — 40 SMP PvP bots auto /kit smp + đánh nhau

const mineflayer = require('mineflayer')
const { pathfinder, goals: { GoalXZ } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

// ==== CẤU HÌNH SERVER CỦA BẠN ====
const SERVER_HOST = process.env.SERVER_HOST || 'node1.lumine.asia'
const SERVER_PORT = Number(process.env.SERVER_PORT || 25675)
const AUTH_MODE   = process.env.AUTH_MODE || 'offline'

// Số lượng bot + delay join
const MAX_BOTS      = 40
const JOIN_DELAY_MS = 2500

// Tên bot: Việt Nam + English trộn (tất cả <= 16 ký tự)
const NAMES = [
  'CuongCute',
  'BaoDepTrai',
  'LinhXinh',
  'AnhHungVN',
  'ThanhNienVN',
  'NoobViet',
  'ProViet',
  'VietGamer',
  'BaoKing',
  'HuyLegend',
  'PhongSky',
  'MinhDark',
  'KietFire',
  'ZenoVN',
  'KenjiVN',
  'DarkBoyVN',
  'SweetGirl',
  'LazyCatVN',
  'TryHarder',
  'SnowAngel',
  'NightWolf',
  'RedPandaVN',
  'KaiVN',
  'ZeroVN',
  'MonkeyKing',
  'FoxCuteVN',
  'RainyDay',
  'SunnyVN',
  'DragonVN',
  'ShadowVN',
  'NhaQueVN',
  'CuTichVN',
  'TimNang',
  'YasuoMain',
  'JungleBoy',
  'MidLaneVN',
  'TopLaneVN',
  'Memaybel',
  'ChaoHet'
].slice(0, MAX_BOTS)

function wait (ms) {
  return new Promise(res => setTimeout(res, ms))
}

// Gửi lệnh /kit smp mỗi lần spawn / respawn
function equipKit (bot) {
  // delay chút cho chắc chắn đã load xong world
  setTimeout(() => {
    try {
      bot.chat('/kit smp')
    } catch (e) {
      console.log(`[${bot.username}] lỗi khi gửi /kit smp:`, e.message)
    }
  }, 1500)
}

// Setup PvP: bot sẽ tìm player gần nhất (không phải chính nó) và lao vào đánh
function setupCombat (bot) {
  bot.on('physicTick', () => {
    // tránh spam khi đang chết
    if (bot.health <= 0) return

    const target = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.username !== bot.username // không đánh chính nó
    )

    if (!target) {
      if (bot.pvp.target) bot.pvp.stop()
      return
    }

    // nếu chưa có target hoặc target khác thì set lại
    if (!bot.pvp.target || bot.pvp.target !== target) {
      bot.pvp.attack(target)
    }
  })
}

// Cho bot đi loanh quanh cho đỡ đứng yên
function wander (bot) {
  setInterval(() => {
    try {
      const x = Math.floor(bot.entity.position.x + (Math.random() * 16 - 8))
      const z = Math.floor(bot.entity.position.z + (Math.random() * 16 - 8))
      bot.pathfinder.setGoal(new GoalXZ(x, z), false)
    } catch (e) {
      // bỏ qua lỗi nhỏ
    }
  }, 12000)
}

function createBot (name) {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: name,
    auth: AUTH_MODE
  })

  bot.loadPlugin(pathfinder)
  bot.loadPlugin(autoEat)
  bot.loadPlugin(pvp)

  // Lần spawn đầu + mỗi lần respawn lại đều gọi /kit smp
  bot.on('spawn', () => {
    console.log(`[${name}] spawned!`)
    bot.autoEat.options = {
      priority: 'foodPoints',
      startAt: 14,
      bannedFood: []
    }
    equipKit(bot)
  })

  // Một số server / phiên bản sẽ bắn event respawn riêng, bắt luôn cho chắc
  bot.on('respawn', () => {
    console.log(`[${name}] respawned!`)
    equipKit(bot)
  })

  // Khi bot chết -> gọi bot.respawn() sau 2s
  bot.on('death', () => {
    console.log(`[${name}] died, respawning soon...`)
    setTimeout(() => {
      try {
        bot.respawn()
      } catch (e) {
        console.log(`[${name}] lỗi respawn:`, e.message)
      }
    }, 2000)
  })

  // Setup combat + đi dạo
  setupCombat(bot)
  wander(bot)

  bot.on('kicked', r => console.log(`[${name}] kicked:`, r))
  bot.on('error', e => console.log(`[${name}] error:`, e))

  return bot
}

// Tạo lần lượt 40 bot, mỗi con join cách nhau JOIN_DELAY_MS
;(async () => {
  for (let i = 0; i < NAMES.length; i++) {
    createBot(NAMES[i])
    await wait(JOIN_DELAY_MS)
  }
})()
