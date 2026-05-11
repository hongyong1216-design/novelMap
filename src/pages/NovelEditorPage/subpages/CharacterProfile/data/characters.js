export const FACTION_TONES = {
  primary:   { bar: '#005aff', text: '#b5c4ff', tagBg: 'rgba(0, 90, 255, 0.1)',   tagBorder: 'rgba(0, 90, 255, 0.2)' },
  tertiary:  { bar: '#c43801', text: '#ffb59f', tagBg: 'rgba(196, 56, 1, 0.1)',   tagBorder: 'rgba(196, 56, 1, 0.2)' },
  secondary: { bar: '#5d73c0', text: '#b5c4ff', tagBg: 'rgba(93, 115, 192, 0.1)', tagBorder: 'rgba(93, 115, 192, 0.2)' },
  outline:   { bar: '#8d90a2', text: '#c3c5d9', tagBg: 'rgba(141, 144, 162, 0.1)', tagBorder: 'rgba(141, 144, 162, 0.2)' },
}

export const factions = [
  { id: 'aether', name: 'Aether Syndicate', subtitle: 'Main Operations',     tone: 'primary' },
  { id: 'iron',   name: 'Iron Vanguard',    subtitle: 'The Old Guard',       tone: 'tertiary' },
  { id: 'ghost',  name: 'Ghost Protocol',   subtitle: 'Underground Network', tone: 'secondary' },
  { id: 'system', name: 'System Entities',  subtitle: null,                  tone: 'outline' },
]

export const characters = [
  {
    id: '001',
    factionId: 'aether',
    name: '沈默 (Shen Mo)',
    role: '中枢',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARqGXkpqtcg_iTuIji6BNEXSx2JmcSJrm2VuM2XgHYQpNsRAbSoHh0Muna3vhG4wkUkLLKjPTQcAeDhDxlYefWqwbepJyfwNuoxR1dvThoPaOtGBgUjNSJF1q6S8tIye4hM6WiikvQPOjeeIPS5yKVDqULJobVEeY7XZo7yqyPjjMYJun6zNP1mQXmd1C1qdFuYf40XnGkxSSAgM1M8IuVZ3452pn820-vDF2yv0LUKMgR1Ct-HUwwLpiuKLCl5PBP8RDS0LySNeI',
    desc: '前哨站01的首席协议执行官。在深蓝色的余烬中，他寻找着那些被遗忘的记忆碎片。他的每一个决定都可能改写整个城市的逻辑流。',
  },
  {
    id: '024',
    factionId: 'aether',
    name: '林依 (Lin Yi)',
    role: '技术支持',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCycPTuwCnG0_N4Hc5B24wKb_GUJ74uFUZRassyNh-G8UAATIhqyo0EPZrcrea-7fkIiiDSWE7mkwoCHMYB4BZ_qjy_I7vRYIuLDPYBGsYR9Br738LFhpUbZ8tw5kTiZq6gRJWgJUu0AWrxdbFxqlhveYD2rDcGyZ-Hjd0UMkPqt2zY-Fa12WzF3ZMs9ybSSIabr1Ogh0WOXzze_LA70naiIwjvVOkLeOTO3KqRFaacG7P_Ey_ymEew_bbaPu8Ztx13f0y-3TSU2-8',
    desc: '她是网络深处的幽灵，能够穿透最严密的防火墙。对她来说，代码就是呼吸。',
  },
  {
    id: '999',
    factionId: 'iron',
    name: '魏先生 (Mr. Wei)',
    role: '威胁',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwuyP1SvpozuTTL5R4WnjObQUaMuV-CGLLx-X6Bc41g_TjFhzNo_fP8n6LOzREOs_1pZrutg8CsmIIri1AfXR_cKWxfT6s3q-ay6LqftnfEw7gaNJ2PMuZ1RltqFl_56d94gxs0QFektxMLPdKmwMPsn0DB4gCDFvSpfUuHcwDRvuyj8sS7_o1BLMZxb-AjcJLkTjjzDubUvDrjOrOTodmHVMhVsG3-H9nraD3BkYHk86Fw5mx5CXw1VR24VPj7BT-IVD1aLDWRFo',
    desc: '旧时代的守门人。他并不害怕改变，他只是想确保改变是在他的掌控之下发生的。',
  },
  {
    id: '???',
    factionId: 'ghost',
    name: 'Echo',
    role: '未知',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtWCmJccvrBHkFqORsL-c_2o83Y_Dll48gUF7FSJq4ZuypbzU0l5R2g2922CM0ONA9QzQhZWPatUWCDwg3p2GUm5iBbpnhFG95kQ-1VuwprcYHCN6bJHfQrj_kphZeTeyMC7m5tTxTCrpNSSgeKLKwawWoOr69DGrHEEvCMRIDXwrbDBxkDrxRJvumln0x2QbK7FVDDiDPIpzjlpR2lVLgz8rFIlay8PuoePSVdmk0kNUy8kmUDEyD-WJU2Zod4_sU-P7g2TsPBic',
    desc: '只在雨天出现的线人。她提供的每一个情报都带有代价。',
  },
  {
    id: 'XX',
    factionId: 'ghost',
    name: '陆风 (Lu Feng)',
    status: 'deceased',
    statusLabel: '已注销',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTyl8EeDdJie7wIKr25UwpSpjhx57VL4hOASvBcR8xWevjEhqLFfvlNLOwb9f1KUU84HhUSUPIiwiQcLOpSFufQJjSAkwrHwnPUVoHa9i_BeNURKp7o80ZYzj20OsE5QNRAy4UM8AStm6zktBnundufa28kK27HdRujhB-htN95i65FOy9a8Y3MbYoxSnN5zJuJUP80_G56JN5MbA9I-VLGtRoHqJryvmVNnlcUGHZJFl_NZRocijMZ9cf41INshwsJJmnLwA3C7w',
    quote: '"为了明天，我们必须忘记今天。"',
  },
  {
    id: 'SYS',
    factionId: 'system',
    type: 'system',
    name: 'SYSTEM_CORE',
    subtitle: 'AI 管理员',
    metrics: [
      { label: '状态', value: '在线',  tone: 'primary' },
      { label: '负载', value: '12.4%', tone: 'default' },
    ],
  },
]
