const Highlights = ({ cards }) => (
  <section className="grid gap-4 md:grid-cols-4">
    {cards.map(({ title, value, subtext, icon }) => {
      const IconComponent = icon;
      return (
        <div
          key={title}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">{title}</p>
            <IconComponent className="h-4 w-4 text-[#9c6bff]" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{value}</p>
          <p className="text-sm text-slate-400 mt-2">{subtext}</p>
        </div>
      );
    })}
  </section>
);

export default Highlights;

