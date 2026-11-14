/*
  Site content for the scrolling career timeline.

  Each entry in `stops` is one point on the timeline. As a visitor scrolls (or drags)
  to a stop, everything listed in it is "collected" into the sidebar:
    - clients  → "Interfaces in production" labels
    - tools    → "Tool kit" (interface / creative / systems)
    - cases    → "Case studies" thumbnails (click to open)
  Scrolling back past a stop puts its items back.

  NOTE: the projects, clients, tools and cases below are PLACEHOLDERS taken from the
  resume. Replace them with the real lists for each part of the timeline.
*/
window.SITE = {
  name: 'Justin Hui',
  role: 'Interface designer · Broadcast control systems',
  photo: '', // e.g. 'assets/img/photo.jpg' — leave empty to show initials
  initials: 'JH',
  email: 'justin.t.hui@gmail.com',
  linkedin: 'https://www.linkedin.com/in/justinhui12',

  stops: [
    {
      yr: 2015, label: '2015',
      when: '2015 to 2017', kind: 'Control room', short: 'Live sports',
      title: 'Giants, Sharks, Stanford',
      body: 'Technical director, replay, graphics and video engineering for live sports. I learned what operators need when it all happens at once.',
      projects: [
        { name: 'SF Giants video-board show', note: 'Technical Director at AT&T Park (SAMMCO) and video ops for the Giants' },
        { name: 'Sharks & Barracuda games', note: 'Technical Director, Chyron graphics and EVS replay at SAP Center' },
        { name: 'Stanford Athletics', note: 'Control room engineering at Stanford Stadium and Maples Pavilion' },
        { name: 'Cisco TV', note: 'WebEx facilitator for live streaming sessions' }
      ],
      clients: [],
      tools: { interface: [], creative: ['Photoshop', 'After Effects', 'Premiere Pro'], systems: ['LSM / XT-VIA'] },
      cases: []
    },
    {
      yr: 2017, label: '2017',
      when: '2017 to 2022', kind: 'EVS · Burbank', short: 'Solutions Architect',
      title: 'Solutions Architect',
      body: 'Shaped systems for Apple, Meta, Riot Games, NBC, ESPN and CBS, and built the Cerebrum interfaces behind every demo.',
      projects: [
        { name: 'System architectures', note: 'Design drawings, tenders and quotations for Apple, Meta, Riot Games, NBC, ESPN and CBS' },
        { name: 'Product demos', note: 'Cerebrum hardware and software interfaces for sales demos and internal training' },
        { name: 'Go-live & hand-over', note: 'Carried customers from install through to support' }
      ],
      clients: ['NBC', 'MLB Network', 'YES Network', 'Rogers Media', 'Dome Productions'],
      tools: { interface: ['Cerebrum Designer', 'Hardware panels'], creative: [], systems: ['Cerebrum', 'Visio', 'Microsoft D365', 'IP Director', 'Neuron'] },
      cases: [
        { title: 'Routing panel builder', tag: 'Visual', img: 'assets/img/panel-builder.jpg',
          blurb: 'Lets operators create the layouts they want on the fly, turning a complicated multi-step process into a visual experience.' }
      ]
    },
    {
      yr: 2022, label: '2022',
      when: '2022 to now', kind: 'EVS · Remote', short: 'Senior Tech Architect',
      title: 'Senior Technical Architect',
      body: 'Designing, coding and supporting operator interfaces used daily at 15+ live facilities, from routing panels to master control.',
      projects: [
        { name: 'Operator interfaces', note: 'From single-operator routing panels to full master-control configuration apps' },
        { name: 'Workflow design', note: 'On-site consultation, panel design in Cerebrum Designer, hand-off, training and support' },
        { name: 'Training & documentation', note: 'Advanced Cerebrum training and internal tools from pre-sales to support' }
      ],
      clients: ['FOX World Cup', 'MLB', 'Scripps', 'Gravity Media', 'LMG', 'Monumental', 'Bell Centre', 'Kraft Sports', 'CA Assembly'],
      tools: { interface: ['Panel prototyping', 'Workflow mapping'], creative: [], systems: ['Git', 'Bitbucket', 'Jira'] },
      cases: [
        { title: 'Proc Control', tag: 'Modular', img: 'assets/img/proc-control.jpg',
          blurb: 'Designed for different formats and platforms, and built from pinnable modules so each operator can assemble their own custom dashboard.' },
        { title: 'System configuration guide', tag: 'Human-centred', img: 'assets/img/config-tool.jpg',
          blurb: 'A configuration tool that doubles as a helper, pointing the user in the right direction and offering a hand through each step.' }
      ]
    },
    {
      yr: 2025, label: '2025',
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
      yr: 2026, label: 'Now',
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
