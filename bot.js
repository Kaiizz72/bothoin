// bot.js — SMP PvP BOT LITE (FINAL + AUTO REJOIN ✅)
// ✅ FIX TRIỆT ĐỂ CHAT 1.21 (unknown chat format)
// ✅ Auto /kit smp
// ✅ Auto reconnect khi bị kick / disconnect
// ✅ Siêu nhẹ – chạy được GitHub / Termux

const mineflayer = require('mineflayer')

// ===== CONFIG SERVER =====
const SERVER_HOST = 'node1.lumine.asia'
const SERVER_PORT = 25675
const SERVER_VERSION = '1.20'

// ===== BOT SETTINGS =====
const MAX_BOTS = 10
const JOIN_DELAY = 9000         // delay giữa bot
const REJOIN_DELAY = 20000      // delay khi bị kick rồi join lại (10s)

// ===== BOT NAMES =====
const NAMES = [
  'CuongCute','BaoDepTrai','LinhXinh','AnhHungVN','ThanhNienVN',
  'NoobViet','ProViet','VietGamer','BaoKing','HuyLegend'
].slice(0, MAX_BOTS)

// ===== FIX CHAT 1.21 — BLOCK AT PROTOCOL LEVEL =====
const framing = require('minecraft-protocol/src/transforms/framing')
const oldPacketNeedsFraming = framing.packetNeedsFraming
framing.packetNeedsFraming = function (packet) {
  if (
    packet?.name === 'chat' ||
    packet?.name === 'player_chat' ||
    packet?.name === 'system_chat'
  ) return false
  return oldPacketNeedsFraming(packet)
}

// ===== UTILS =====
const sleep = ms => new Promise(r => setTimeout(r, ms))

function giveKit(bot) {
  setTimeout(() => {
    try { bot.chat('/kit smp') } catch {}
  }, 3000)
}

// ===== COMBAT (NHẸ) =====
function combat(bot) {
  setInterval(async () => {
    if (!bot.entity || bot.health <= 0) return

    const target = bot.nearestEntity(e =>
      e.type === 'player' && e.username !== bot.username
    )
    if (!target) return

    const d = bot.entity.position.distanceTo(target.position)
    if (d > 4) return

    try {
      await bot.lookAt(target.position.offset(0, 1.6, 0), true)
      bot.attack(target)
    } catch {}
  }, 800)
}

// ===== BOT FACTORY (AUTO REJOIN) =====
function spawnBot(name) {
  console.log(`[BOT] spawning ${name}`)

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: name,
    auth: 'offline',
    version: SERVER_VERSION,
    hideErrors: true
  })

  let reconnecting = false

  function scheduleRejoin(reason) {
    if (reconnecting) return
    reconnecting = true
    console.log(`[${name}] disconnected (${reason}) → rejoin in ${REJOIN_DELAY / 1000}s`)
    setTimeout(() => spawnBot(name), REJOIN_DELAY)
  }

  bot.on('spawn', () => {
    console.log(`[${name}] joined`)
    giveKit(bot)
  })

  bot.on('respawn', () => giveKit(bot))

  bot.on('death', () => {
    setTimeout(() => {
      try { bot.respawn() } catch {}
    }, 2000)
  })

  // ✅ AUTO REJOIN
  bot.on('kicked', reason => scheduleRejoin('kick'))
  bot.on('end', () => scheduleRejoin('end'))
  bot.on('error', () => scheduleRejoin('error'))

  combat(bot)
  return bot
}

// ===== START ALL BOTS =====
;(async () => {
  for (const name of NAMES) {
    spawnBot(name)
    await sleep(JOIN_DELAY)
  }
})()
