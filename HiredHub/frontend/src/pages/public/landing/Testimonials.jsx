import Avatar from '../../../components/common/Avatar';

// Sample copy for the demo. Replace with real customer quotes before launch.
const QUOTES = [
  { name: 'Meera Nair', role: 'Frontend developer', text: 'I stopped keeping a spreadsheet. The board shows where every application stands, and my interview dates sit right on the cards.' },
  { name: 'Arjun Kapoor', role: 'Data analyst', text: 'The match breakdown showed me the two skills I was missing for a role. I learned them and applied again.' },
  { name: 'Sana Khan', role: 'Talent partner', text: 'Candidates arrive with a clear score next to their resume, so building a shortlist takes minutes instead of hours.' },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight">People who stopped juggling tabs and spreadsheets</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure key={q.name} className="flex flex-col rounded-card border border-slate-200 bg-surface p-6">
              <blockquote className="flex-1 leading-relaxed text-slate-700">“{q.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar user={{ name: q.name }} size={40} />
                <div><p className="text-sm font-bold">{q.name}</p><p className="text-xs text-slate-500">{q.role}</p></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
