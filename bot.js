const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const QRCode = require('qrcode')
const qrcode = require('qrcode-terminal')
const express = require('express')

const app = express()
let lastQR = ""
app.get('/', (req,res)=> res.send('Bot Hidup. Buka /qr buat scan'))
app.get('/qr', async (req,res)=>{
  if(!lastQR) return res.send('Sudah konek atau QR belum muncul. Cek LOGS di Render.')
  const img = await QRCode.toDataURL(lastQR)
  res.send(`<center><h2>Scan pakai WA CADANGAN (yang jadi bot)</h2><img src="${img}" width="300"><br>Refresh tiap 20 detik<script>setTimeout(()=>location.reload(),20000)</script></center>`)
})
app.listen(10000)

async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (u)=>{
    if(u.qr){ lastQR = u.qr; qrcode.generate(u.qr,{small:true}); console.log("QR MUNCUL, buka /qr") }
    if(u.connection==='open'){ console.log("✅ BOT KONEK!"); lastQR=""; listGroups() }
  })
  async function listGroups(){
    const groups = await sock.groupFetchAllParticipating()
    console.log("=== DAFTAR GRUP, COPY ID NYA ===")
    for(let id in groups) console.log(groups[id].subject+" -> "+id)
  }
  
  // CONTOH SINYAL AI TIAP 5 MENIT
  setInterval(async ()=>{
    const GROUP_ID = process.env.GROUP_ID
    if(!GROUP_ID) return console.log("Belum set GROUP_ID")
    if(Math.random() > 0.8){
      const harga = (2670 + Math.random()*20).toFixed(2)
      const text = `🟢 *GOLD SCALPING AI - M15*\n━━━━━━━━━━━━\nBUY NOW ${harga}\nSL: -700 | TP1: +400 | TP2: +900\nHold 1-2 Jam\n⏰ ${new Date().toLocaleTimeString('id-ID')}`
      await sock.sendMessage(GROUP_ID, {text})
      console.log("Sinyal terkirim")
    }
  }, 5*60*1000)
}
start()
