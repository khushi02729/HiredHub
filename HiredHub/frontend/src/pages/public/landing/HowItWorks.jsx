const STEPS = [
  ['Build your profile', 'Add your skills, experience and preferred locations once. Every match score is calculated from them.'],
  ['Find roles that fit', 'Filter by skills, salary and work mode, then see which skills you match and which ones you are missing.'],
  ['Apply in one step', 'Attach a resume and a cover letter. HiredHub stops you from applying to the same job twice.'],
  ['Track every stage', 'Move each application through Applied, Assessment, Interview, Offer and Rejected on your own board.'],
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight">From first search to signed offer in four steps</h2>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
          <div aria-hidden="true" className="absolute left-5 right-5 top-5 hidden h-px bg-gradient-to-r from-primary-200 via-violet-200 to-primary-200 md:block" />
          {STEPS.map(([title, text], i) => (
            <li key={title} className="relative flex gap-4 md:block">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white shadow-lift">{i + 1}</span>
              <div className="md:mt-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
