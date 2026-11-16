# 🚀 MASTER PROMPT: BUILD "VIBE-TYPER" (CYBER MECH-KEY ARENA) IN NEXT.JS

> **Mục tiêu:** Tạo một Web App luyện gõ phím mang phong cách **Cyberpunk / Arcade / ASMR**, kết hợp giữa cảm giác bấm phím cơ đanh giòn chân thực, nhạc nền tùy chọn (Chill Lofi vs Sôi động Synthwave/Phonk), hiệu ứng đồ họa nổ hạt bùng nổ theo Combo Streak (Power Mode), và đạt hiệu năng chuẩn eSports **60–144 FPS không giật lag (Zero Input Lag)**.

---

## 🎯 1. TỔNG QUAN DỰ ÁN & VIBE THẨM MỸ

* **Tên dự án:** `VibeTyper` (hoặc `MechVibe Arena`)
* **Vibe đồ họa:** Cyberpunk Dark Mode (`#0a0a0f`), Neon Glow (Cyan `#00f0ff`, Electric Amber `#ffb703`, Crimson Flare `#ff0055`, Acid Purple `#b5179e`), Typography monospaced (JetBrains Mono / Fira Code).
* **Trải nghiệm cốt lõi (Core Loop):**
  1. Người dùng chọn chế độ nhạc: **☕ Chill Lo-fi** (thư giãn) hoặc **⚡ Hype Synthwave/Phonk** (sôi động).
  2. Chọn loại switch phím cơ yêu thích: *Gateron Yellow (Thocky/Creamy)*, *Cherry Blue (Clicky)*, hoặc *Boba U4T (Tactile)*.
  3. Bắt đầu gõ các đoạn code thực tế hoặc danh ngôn công nghệ.
  4. Mỗi phím bấm phát ra âm thanh phím cơ chân thực đanh giòn, hạt phát sáng (particles) nổ tung từ vị trí con trỏ.
  5. Càng gõ đúng chuỗi liên tục (Combo Streak), màn hình càng bùng nổ: rung chấn màn hình (Screen Shake), tia sét lan tỏa, đổi màu giao diện và thanh combo nhảy số cực đã!

---

## 🛠️ 2. TECH STACK & QUY CHUẨN KỸ THUẬT

* **Framework:** Next.js (App Router), React 19, TypeScript.
* **Styling:** Tailwind CSS (hỗ trợ CSS GPU transform).
* **Icons:** `lucide-react`.
* **State Management:**
  * **Low-frequency State (Zustand):** Nhạc nền, âm lượng, loại switch, settings, thống kê tổng kết.
  * **High-frequency State (`useRef` + Direct DOM manipulation):** Vị trí con trỏ gõ, combo tức thời, WPM realtime, mảng hạt particle để **triệt tiêu 100% React re-render lag**.
* **Audio Engine:** **Web Audio API thuần (Native)** với `AudioContext`, `AudioBufferSourceNode`, `GainNode`, và `AnalyserNode`. (Không dùng thẻ `<audio>` thông thường để tránh độ trễ 50-100ms).
* **Graphics/VFX Engine:** **HTML5 Canvas 2D** kết hợp kỹ thuật **Object Pooling** (Zero Garbage Collection micro-stutters).

---

## ⚡ 3. CÁC PHÂN HỆ VÀ TÍNH NĂNG CHI TIẾT

### 🎵 A. Audio & Jukebox Engine (`lib/audio/`)
1. **Mechanical Switch SFX:**
   * Tải và decode sẵn các file âm thanh phím cơ (`.mp3`/`.wav`) vào bộ nhớ RAM (`AudioBuffer`) ngay khi ứng dụng khởi chạy.
   * **Voice Capping / Concurrency Limiter:** Giới hạn tối đa 10 âm thanh cùng lúc. Nếu gõ quá nhanh (>120 WPM), tự động ngắt voice cũ nhất để tránh nghẽn âm thanh và clipping.
   * **Micro-Pitch Randomization:** Mỗi lần bấm phím, thay đổi tần số phát ngẫu nhiên $\pm 4\%$ (`playbackRate.value = 0.96 -> 1.04`) để tiếng gõ tự nhiên, không bị máy móc.
2. **Dual-Mode Jukebox (Nhạc nền):**
   * Cho phép chọn 2 kênh nhạc nền trực tiếp trên thanh công cụ:
     * **☕ Kênh Chill:** Lo-fi beats nhẹ nhàng, tiếng vinyl crackle, tiếng mưa rơi thư giãn.
     * **⚡ Kênh Sôi Động:** Synthwave, Cyberpunk, Phonk nhịp 120-140 BPM, bass đập căng tràn năng lượng.
   * **Realtime Audio Visualizer:** Kết nối nhạc nền với `AnalyserNode` để hiển thị dải sóng âm mini (audio spectrum) nhảy nhót ở góc màn hình.
   * Nút gạt chỉnh âm lượng riêng biệt cho **Tiếng phím** và **Tiếng nhạc nền**.

---

### 💥 B. Particle & Screen Shake Engine (`lib/canvas/`)
1. **Object Pooling cho Hạt (Zero Garbage Collection):**
   * Khởi tạo sẵn một mảng cố định 300 hạt (`Particle`). Khi gõ phím, lấy các hạt không hoạt động (`active = false`) ra gán tọa độ con trỏ, vận tốc, góc bay và màu sắc.
   * Hạt mờ dần (`alpha <= 0`) sẽ trả về trạng thái ngủ. Không bao giờ chạy `new Particle()` trong vòng lặp gõ phím.
2. **Combo Streak Tiers (Hiệu ứng tăng dần theo điểm số):**
   * **Level 1 (0 – 15 combo):** Hạt bụi sáng neon li ti (Cyan/Blue), bay nhẹ nhàng.
   * **Level 2 (16 – 35 combo):** Tia lửa vàng điện (Electric Amber), tốc độ nổ nhanh hơn.
   * **Level 3 (36 – 60 combo - ON FIRE 🔥):** Bùng nổ sắc đỏ cam, màn hình bắt đầu rung nhẹ (Micro-shake).
   * **Level 4 (61+ combo - GODLIKE ⚡):** Màn hình rung dữ dội (Screen Shake GPU), tia sét tím bao phủ viền màn hình, chữ gõ có vệt sao băng (motion trail), hiệu ứng nổ hạt rực rỡ như pháo hoa.
3. **Screen Shake chuẩn GPU:**
   * Dùng CSS `transform: translate3d(x, y, 0)` kết hợp `will-change: transform`. Tuyệt đối không can thiệp vào `top/left/margin` để tránh Layout Reflow.

---

### ⌨️ C. Typing Mechanics & Gamification (`lib/typing/`)
1. **Chế độ bài gõ (Typing Modes):**
   * **Code Snippets:** Luyện gõ các đoạn code JavaScript, TypeScript, Python, CSS đẹp mắt.
   * **Hacker / Cyber Quotes:** Các câu nói kinh điển về lập trình, hacker, công nghệ.
   * **Zen Free-Rant:** Gõ tự do không bị bắt lỗi, gõ xả stress với hiệu ứng nổ phím.
2. **Chỉ số thời gian thực (Realtime HUD):**
   * **WPM (Words Per Minute)** & **CPM (Characters Per Minute)**.
   * **Accuracy (% chính xác)**.
   * **Combo Streak Counter:** Điểm số nảy to dần theo chuỗi gõ đúng.
   * **Heat Gauge (Thanh nộ):** Đầy cây nộ để mở khóa hiệu ứng đặc biệt.

---

## 📁 4. CẤU TRÚC THƯ MỤC DỰ ÁN ĐỀ XUẤT

```text
src/
├── app/
│   └── page.tsx                     # Trang chính: Layout Dark Cyberpunk
├── components/
│   ├── arena/
│   │   ├── TypingArena.tsx          # Vùng hiển thị text đang gõ và con trỏ
│   │   ├── ParticleCanvas.tsx       # Canvas 2D vẽ hạt & hiệu ứng nổ
│   │   └── ComboHUD.tsx             # Đồng hồ đo WPM, Accuracy, Streak
│   ├── jukebox/
│   │   ├── JukeboxPlayer.tsx        # Trình phát nhạc Chill / Hype + Volume
│   │   └── AudioVisualizer.tsx      # Thanh sóng âm thanh nhảy theo điệu nhạc
│   └── controls/
│       ├── SwitchSelector.tsx       # Menu chọn Switch (Yellow, Blue, Tactile)
│       └── ModeSelector.tsx         # Chọn bài gõ (Code, Quotes, Zen)
├── lib/
│   ├── audio/
│   │   ├── AudioEngine.ts           # Web Audio API: Switch SFX, Voice Limiter
│   │   └── JukeboxEngine.ts         # Quản lý nhạc nền & AnalyserNode
│   ├── canvas/
│   │   ├── ParticlePool.ts          # Bộ quản lý 300 hạt Object Pool
│   │   └── RenderLoop.ts            # requestAnimationFrame render hạt & trail
│   └── typing/
│       ├── typingStore.ts           # Zustand store cho settings & stats
│       └── wordsBank.ts             # Kho code snippets & quotes
└── public/
    └── sounds/
        ├── switches/                # File âm thanh switch phím cơ
        └── music/                   # Nhạc nền chill và sôi động (royalty-free)
```

---

## 🛡️ 5. BỘ TIÊU CHUẨN TỐI ƯU HIỆU NĂNG BẮT BUỘC (CHECKLIST)

- [ ] **Zero React Input Delay:** Không đưa state của từng ký tự gõ phím vào React state cấp cao. Chỉ dùng `useRef` hoặc DOM node cục bộ.
- [ ] **Object Pooling:** Toàn bộ hạt Particle tái sử dụng mảng cố định, không cấp phát bộ nhớ mới khi đang gõ.
- [ ] **Web Audio Pre-decoding:** Toàn bộ âm thanh được `decodeAudioData()` ngay khi load trang.
- [ ] **High-DPI Retina Display:** Canvas tự động điều chỉnh scale theo `window.devicePixelRatio`.
- [ ] **Motion Blur Trail:** Vẽ lớp phủ bán trong suốt `rgba(10, 10, 15, 0.2)` mỗi frame trên Canvas để tạo vệt sáng sao băng mà không tốn GPU.
- [ ] **GPU Accelerated Shake:** Rung chấn áp dụng trên container bằng `translate3d` và class có `will-change: transform`.

---

## 💡 HƯỚNG DẪN DÀNH CHO AI / DEVELOPER KHI BẮT ĐẦU CODE

> **Hãy bắt đầu bằng cách triển khai theo thứ tự sau:**
> 1. Xây dựng file `AudioEngine.ts` với Web Audio API: Có sẵn âm thanh phím mô phỏng (tổng hợp dao động oscillator hoặc nạp soundpack) để khi bấm phím là kêu ngay lập tức không trễ.
> 2. Xây dựng `ParticlePool.ts` và component `ParticleCanvas.tsx` với Canvas 2D vẽ nổ hạt theo tọa độ con trỏ.
> 3. Dựng `TypingArena.tsx` bắt sự kiện `keydown`, tính toán Combo, kích hoạt Screen Shake và gọi Particle.
> 4. Tích hợp `JukeboxPlayer.tsx` với luồng nhạc Chill/Hype và thanh Visualizer sóng âm.
> 5. Polish giao diện Cyberpunk Dark Mode với Tailwind CSS, đảm bảo khi gõ liên tục đạt 120 FPS mượt mà.

