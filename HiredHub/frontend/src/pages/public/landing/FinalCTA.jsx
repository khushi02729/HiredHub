import Button from '../../../components/common/Button';

export default function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-panel bg-brand px-6 py-14 text-center text-white sm:px-12">
        <div aria-hidden="true" className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-white/10" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Start tracking your next move today</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">Create a free account, add your skills, and see which open roles fit you best.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/register" variant="light" size="lg">Create free account</Button>
            <Button to="/register?role=recruiter" size="lg" className="border border-white/40 bg-transparent text-white hover:bg-white/10">I am hiring</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
