# User Experience & Interactive Flows

## 1. Overview of the Dual Experience

The application is structured around a **Dual-Mode Architecture**:
1. **The 3D Cyberpunk Room:** An exploratory 3D spatial environment centered on a developer workstation.
2. **The Flat Landing Portfolio:** A structured, high-contrast, linear presentation of experience, technical proficiencies, and open-source contributions.

Visitors transition fluidly between both worlds using tactile optical glass buttons or browser URL hashes (`#room` vs `#portfolio`).

---

## 2. Interactive Flows

### Flow 1: First Visit & Entry Lanyard Badge (`LanyardIntro`)

```mermaid
flowchart TD
    Start([Visitor lands on /]) --> CheckParam{URL contains skip or hash?}
    CheckParam -- Yes --> InstantEnter[Bypass Intro Phase -> Ready]
    CheckParam -- No --> ShowLanyard[Render 3D Holographic Lanyard Badge]
    
    ShowLanyard --> UserAction{Visitor Action}
    UserAction -- Pulls Badge Downward --> DownDominance{dy >= 0.6 dx & distance > threshold?}
    DownDominance -- Yes --> TriggerEnter[Play Hologram dissolution & Room Build]
    DownDominance -- No --> SpringReturn[Spring-damped Badge Snapback]
    
    UserAction -- Presses ENTER / SPACE / ESC --> TriggerEnter
    UserAction -- Clicks Skip Button --> TriggerEnter
    
    TriggerEnter --> CheckDevice{Device allows 3D? width >= 1024px & pointer: fine}
    CheckDevice -- Yes --> RoomActive[Activate 3D Nocturnal Cyberpunk Room]
    CheckDevice -- No (Mobile / Tablet / Touch) --> DirectFlat[Directly Enter Flat Landing & set #portfolio]
```

---

### Flow 2: 3D Room Exploration & Hotspot Navigation

```mermaid
flowchart TD
    RoomActive[Room Overview Camera: Raised & Pitched Downward] --> MouseMove[Pointer moves within 100svh Hero]
    MouseMove --> Parallax[Calculate subtle exponential damped parallax]
    
    MouseMove --> Raycast{Cursor intersects interactive 3D object?}
    Raycast -- Monitor Mesh --> HighlightMonitor[Cyan OutlinePass Bloom + 'USE COMPUTER' Tooltip]
    Raycast -- Arcade Cabinet --> HighlightArcade[Magenta OutlinePass Bloom + 'USE ARCADE' Tooltip]
    Raycast -- Oiia Cat --> HighlightCat[Neon OutlinePass Bloom + 'oiia ?' Tooltip]
    Raycast -- Empty Desk --> ClearHighlight[Fade tooltips & neutral camera alignment]
    
    HighlightMonitor -- Click or Press '1'/'M' --> ZoomMonitor[Camera lerps to monitorScreenPose: 0.7s quintic smootherstep]
    HighlightArcade -- Click or Press '2'/'A' --> ZoomArcade[Camera lerps to arcadeFocusPose: 0.7s quintic smootherstep]
    HighlightCat -- Click --> TriggerDance[Start Oiia Cat Musical Dance]
```

---

### Flow 3: Virtual Monitor Desktop & App Workflow

```mermaid
flowchart TD
    InMonitor[In Monitor View: 2D HTML Desktop projected on 3D mesh] --> DesktopState{Visitor Interaction}
    
    DesktopState -- Double Click about-me.txt --> OpenAboutMe[Launch retro text editor window with biography]
    DesktopState -- Drag Project Icon --> MoveIcon[Reposition glyph within clamped desktop boundaries]
    DesktopState -- Double Click Project Icon --> OpenProject[Launch Project Window with highlights & demo button]
    DesktopState -- Hover GitHub Ring --> ShowContribTooltip[Display calculated 4-hour cached contributions]
    
    OpenProject --> WindowControls{Window Action}
    WindowControls -- Drag Titlebar --> DragWindow[Move window via pointer capture; clamp to status bar]
    WindowControls -- Click Maximize --> FullDesktop[Expand window across full virtual desktop area]
    WindowControls -- Click Close / Press ESC --> CloseWindow[Destroy active window; return focus to desktop icon]
    
    DesktopState -- Click Go Back / Press ESC --> ReturnRoom[Return camera to Room Overview pose]
```

---

### Flow 4: Retro Arcade Cabinet & Playable Mini-Games

```mermaid
flowchart TD
    InArcade[In Arcade View: CRT curvature & scanline overlay] --> BrowseMenu[Browse game list via arrows or touch]
    BrowseMenu --> SelectGame{Choose Mini-Game}
    
    SelectGame -- Cyber Flappy --> RunFlappy[Initialize Flappy canvas loop & synth audio]
    SelectGame -- Cyber Tetris --> RunTetris[Initialize Tetris grid, SRS rotation & bag generator]
    SelectGame -- Pixel Run --> RunPixelRun[Initialize infinite side-scroller obstacle engine]
    SelectGame -- Snake Grid --> RunSnake[Initialize 20x20 directional grid loop]
    SelectGame -- Deparkanoid --> RunDeparkanoid[Initialize brick breaker paddle trajectory]
    SelectGame -- Crash Bandicoot --> LoadPS1FUN[Attempt sandboxed iframe; show fallback if blocked]
    
    RunFlappy --> GameOver{Game Over or Exit?}
    GameOver -- Press ESC / Click Exit Game --> ReturnArcadeMenu[Disconnect audio synth; return to Arcade Menu]
```

---

### Flow 5: Musical Oiia Cat & Disco Drop Sync

```mermaid
sequenceDiagram
    participant User
    participant Cat as OiiaCat (3D Model)
    participant Audio as oiiaAudio (Web Audio)
    participant Room as RoomScene (Lighting)
    participant Monitor as MonitorDesktop (Virtual OS)

    User->>Cat: Clicks cat mesh in 3D room
    Cat->>Audio: play(160 BPM soundtrack)
    Cat->>Cat: Retract paws to 'loaf' mode & begin spin
    
    Note over Audio,Room: Drop Window 1 (33s–57s) & Drop Window 2 (81s–105s)
    Audio->>Room: Signal dropActive = true
    Room->>Room: Strobe ambient & point lights in neon cycles
    Audio->>Monitor: Signal dropActive = true
    Monitor->>Monitor: Hide desktop icons; activate 2x 2D dancing cat sync
    
    Note over Audio,Room: Drop Ends / Track Stops / User Navigates Away
    Cat->>Cat: Return to neutral seated pose
    Room->>Room: Restore nocturnal cyan-to-magenta ambient lighting
    Monitor->>Monitor: Restore standard virtual desktop and status bar
```

---

### Flow 6: Digital Laser Portal Transition to Flat Landing

```mermaid
flowchart TD
    InRoom[Visitor inside 3D Room] --> ClickExit[Clicks WebGL2 'Exit The Room' TactileButton]
    ClickExit --> Snapshot[Capture WebGL canvas snapshot to memory]
    ClickExit --> StartPortal[Execute vertical laser scanline sweep: calc 100cqh + 40px]
    ClickExit --> UpdateHash[Set window.location.hash = '#portfolio']
    
    StartPortal --> RevealFlat[Crossfade to full-bleed ASCII room loop video]
    RevealFlat --> FlatLandingActive[Mount Flat Landing Portfolio]
    
    FlatLandingActive --> ScrollExplore[Scroll through Tech Stack, Experience, GitHub City]
    
    FlatLandingActive --> CheckReenterDevice{Is device desktop with fine pointer?}
    CheckReenterDevice -- No (Mobile / Tablet) --> MobileNav[Show 'Get in Touch' button; suppress room entry]
    CheckReenterDevice -- Yes --> ClickReenter[Click 'Re-enter' in header or 'Enter The Room' in footer]
    ClickReenter --> ExpandVideo[Reverse portal transition: expand ASCII frame to 100svh]
    ExpandVideo --> RestoreRoom[Unpause WebGL canvas loop & resume 3D room navigation]
```
