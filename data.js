/*
  Site content for the scrolling career timeline.

  Each entry in `stops` is one point on the timeline. As a visitor scrolls (or drags)
  to a stop, everything listed in it is "collected" into the sidebar:
    - clients  → "Interfaces in production" labels
    - tools    → "Tool kit" (interface / creative / systems)
    - cases    → "Case studies" thumbnails (click to open). Cases with an `id` also appear
                 in the Design gallery (gallery.html), which tells their full story from
                 `problem`, `solution`, `result` and `role`.
  Scrolling back past a stop puts its items back.

  passing (optional) = labels collected one by one between this stop and the next,
        without a dot of their own on the timeline.

  type: 'major' = a job (gold dot, name always shown on the timeline)
        'minor' = a key project (blue dot, name shown when you reach it).
  Minor stops sit between the jobs either side. `yr` can be null if unknown.

  NOTE: the projects, clients, tools and cases below are PLACEHOLDERS taken from the
  resume. Replace them with the real lists for each part of the timeline.
*/
window.SITE = {
  name: 'Justin Hui',
  role: 'Interface designer · Broadcast control systems',
  photo: 'assets/img/photo.jpg', // leave empty to show initials instead
  initials: 'JH',
  email: 'justin.t.hui@gmail.com',
  linkedin: 'https://www.linkedin.com/in/justinhui12',

  stops: [
    {
      type: 'major', yr: 2015, label: '2015',
      span: 1.75, // length of the 2015–2017 stretch on the timeline (30% shorter than the default 2.5)
      when: '2015 to 2017', kind: 'Engineer & graphics designer', short: 'Broadcast\nEngineering', // \n = line break
      title: 'Giants, Sharks, Stanford',
      body: 'Broadcast engineer and motion graphics designer for the SF Giants, San Jose Sharks and Stanford Athletics. I kept the control rooms, replay and video boards running, and created the motion graphics fans saw in the stands.',
      projects: [
        { name: 'San Francisco Giants', note: 'Control-room engineering, ballpark signage systems and gameday motion graphics; Technical Director for the AT&T Park video-board show' },
        { name: 'San Jose Sharks', note: 'Technical Director, Chyron graphics and EVS replay for Sharks and Barracuda games at SAP Center' },
        { name: 'Stanford Athletics', note: 'Control room engineering at Stanford Stadium and Maples Pavilion, plus video-board content design and animation' }
      ],
      clients: [],
      tools: { interface: [], creative: ['Photoshop', 'After Effects', 'Premiere Pro'], systems: ['LSM / XT-VIA'] },
      cases: []
    },
    {
      type: 'major', yr: 2017, label: '2017',
      when: '2017 to 2022', kind: 'EVS · Burbank', short: 'Solutions Architect',
      title: 'Solutions Architect',
      body: 'Shaped systems for Apple, Meta, Riot Games, NBC, ESPN and CBS, and built the Cerebrum interfaces behind every demo.',
      projects: [
        { name: 'System architectures', note: 'Design drawings, tenders and quotations for Apple, Meta, Riot Games, NBC, ESPN and CBS' },
        { name: 'Product demos', note: 'Cerebrum hardware and software interfaces for sales demos and internal training' },
        { name: 'Go-live & hand-over', note: 'Carried customers from install through to support' }
      ],
      clients: ['NBC', 'MLB Network', 'YES Network', 'Dome Productions'],
      tools: { interface: ['Cerebrum Designer', 'Hardware panels'], creative: [], systems: ['Cerebrum', 'Visio', 'Microsoft D365', 'IP Director', 'Neuron'] },
      cases: [
        { id: 'panel-builder', title: 'Routing panel builder', tag: 'Visual', img: 'assets/img/panel-builder.jpg',
          blurb: 'Lets operators create the layouts they want on the fly, turning a complicated multi-step process into a visual experience.',
          // DRAFT gallery story: written from the blurb above, edit with the real details
          role: 'Design & build · Cerebrum Designer',
          problem: 'Changing a routing panel meant a multi-step configuration job that only an engineer could do. Operators were stuck with whatever layout they had been given, even when the show changed.',
          solution: 'I turned the configuration into a visual builder. Operators pick sources and destinations and place them on the panel directly, seeing the result as they go, with no settings screens in between.',
          result: 'Operators now create the layouts they want on the fly, without waiting for an engineer.' }
      ]
    },
    {
      type: 'minor', yr: 2018, label: '2018',
      when: '2018', kind: 'Key project', short: 'Meta (Facebook)',
      title: 'Meta (Facebook)',
      // PLACEHOLDER body/projects: replace with the real project story
      body: 'Shaped the system architecture around Meta’s requirements, from design drawings to the Cerebrum interfaces behind it.',
      projects: [],
      clients: ['Facebook'],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: null, label: '', // PLACEHOLDER key project
      when: 'Solutions Architect', kind: 'Key project', short: 'Project 2',
      title: 'Key project (details to come)',
      body: 'Details for this project are on the way.',
      projects: [],
      clients: [],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: 2021, label: '2021',
      when: '2021', kind: 'Key project', short: 'Riot Games',
      title: 'Riot Games',
      // PLACEHOLDER body: replace with what the project was
      body: 'Shaped the system architecture around Riot Games’ requirements, from design drawings to the Cerebrum interfaces behind it.',
      projects: [],
      clients: ['Riot Games'],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'major', yr: 2022, label: '2022',
      when: '2022 to 2026', kind: 'EVS · Remote', short: 'Technical Architect',
      title: 'Technical Architect',
      body: 'Designing, coding and supporting operator interfaces used daily at 15+ live facilities, from routing panels to master control.',
      projects: [
        { name: 'Operator interfaces', note: 'From single-operator routing panels to full master-control configuration apps' },
        { name: 'Workflow design', note: 'On-site consultation, panel design in Cerebrum Designer, hand-off, training and support' },
        { name: 'Training & documentation', note: 'Advanced Cerebrum training and internal tools from pre-sales to support' }
      ],
      clients: ['MLB', 'Monumental', 'CA Assembly'],
      tools: { interface: ['Panel prototyping', 'Workflow mapping'], creative: [], systems: ['Git', 'Bitbucket', 'Jira'] },
      cases: [
        { id: 'proc-control', title: 'Proc Control', tag: 'Modular', img: 'assets/img/proc-control.jpg',
          blurb: 'Designed for different formats and platforms, and built from pinnable modules so each operator can assemble their own custom dashboard.',
          // DRAFT gallery story: written from the blurb above, edit with the real details
          role: 'UX, UI & build · Technical Architect',
          problem: 'Processing control had to work across different formats and platforms, and every operator watches a different set of signals. One fixed screen could not suit them all.',
          solution: 'I broke the interface into pinnable modules. Each operator assembles the dashboard they need from the same building blocks, and the layout adapts to the format and platform it runs on.',
          result: 'One interface that every operator can make their own, instead of a different build for each desk.' },
        { id: 'config-guide', title: 'System configuration guide', tag: 'Human-centred', img: 'assets/img/config-tool.jpg',
          blurb: 'A configuration tool that doubles as a helper, pointing the user in the right direction and offering a hand through each step.',
          // DRAFT gallery story: written from the blurb above, edit with the real details
          role: 'UX, UI & build · Technical Architect',
          problem: 'Configuring the system was a long list of settings with no sense of order. New users did not know where to start, and mistakes only showed up later, on air.',
          solution: 'I designed the tool as a guide as well as a form. It points to the next step, explains what each setting does in plain words, and offers a hand at the points where people used to get stuck.',
          result: 'Configuration that new users can complete on their own, with fewer mistakes reaching the live show.' }
      ]
    },
    {
      type: 'minor', yr: 2022, label: '2022',
      when: '2022', kind: 'Key project', short: 'Gravity Media',
      title: 'Gravity Media',
      // PLACEHOLDER body: replace with what the project was
      body: 'Operator interfaces designed, deployed and supported for Gravity Media.',
      projects: [],
      clients: ['Gravity Media'],
      // Collected one by one between Gravity Media (2022) and Kraft Sports (2023), in this order
      passing: ['FOX World Cup', 'Bell Centre', 'LMG'],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: 2023, label: '2023',
      when: '2023', kind: 'Key project', short: 'Kraft Sports',
      title: 'Kraft Sports',
      // PLACEHOLDER body: replace with what the project was
      body: 'Operator interfaces designed, deployed and supported for Kraft Sports.',
      projects: [],
      clients: ['Kraft Sports'],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: 2024, label: '2024',
      when: '2024', kind: 'Key project', short: 'Scripps',
      title: 'Scripps',
      // PLACEHOLDER body: replace with what the project was
      body: 'Operator interfaces designed, deployed and supported for Scripps.',
      projects: [],
      clients: ['Scripps'],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: null, label: '', // PLACEHOLDER key project
      when: 'Technical Architect', kind: 'Key project', short: 'Project 4',
      title: 'Key project (details to come)',
      body: 'Details for this project are on the way.',
      projects: [],
      clients: [],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: null, label: '', // PLACEHOLDER key project
      when: 'Technical Architect', kind: 'Key project', short: 'Project 5',
      title: 'Key project (details to come)',
      body: 'Details for this project are on the way.',
      projects: [],
      clients: [],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: 2025, label: '2025',
      when: '2025', kind: 'Certificate', short: 'Google UX',
      title: 'Google UX Design certificate',
      body: 'Putting formal UX method behind ten years of designing with operators at their desks.',
      projects: [
        { name: 'Foundations of User Experience (UX) Design', note: 'Google' }
      ],
      clients: [],
      tools: { interface: [], creative: ['Figma'], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: 2026, label: '2026',
      when: '2026', kind: 'Key project', short: 'UI Packages',
      title: 'UI Packages',
      // PLACEHOLDER body: replace with what the project was
      body: 'Details for this project are on the way.',
      projects: [],
      clients: [],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'major', yr: 2026, label: '2026',
      when: '2026 to now', kind: 'EVS · Remote', short: 'Senior Tech Architect',
      title: 'Senior Technical Architect',
      // PLACEHOLDER body/projects: replace with the real story for this stop
      body: 'Promoted to Senior Technical Architect, leading the design, build and support of operator interfaces for live broadcast facilities.',
      projects: [],
      clients: [],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'minor', yr: 2026, label: '2026',
      when: '2026', kind: 'Key project', short: 'Rogers Media',
      title: 'Rogers Media',
      // PLACEHOLDER body: replace with what the project was
      body: 'Operator interfaces designed, deployed and supported for Rogers Media.',
      projects: [],
      clients: ['Rogers Media'],
      tools: { interface: [], creative: [], systems: [] },
      cases: []
    },
    {
      type: 'major', yr: 2026, label: 'Now',
      when: 'Now', kind: 'Looking for', short: 'UI / UX role',
      title: 'A UI / UX design role',
      body: 'Simple, clean interfaces anyone can pick up without training. Hybrid or remote from Millbrae, CA.',
      projects: [],
      cta: true,
      clients: [{ name: 'Your team?', accent: true }],
      tools: { interface: [], creative: [], systems: [] },
      cases: [
        { title: 'Your project?', tag: 'Next', placeholder: true,
          blurb: 'This slot is open. Let’s talk about what you’re building.' }
      ]
    }
  ]
};
