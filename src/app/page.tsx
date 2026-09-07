import { createClient } from "@/lib/supabase/server";

type Cuvant = {
  id: string;
  titlu: string;
  continut: string;
};

async function getCuvinte(): Promise<Cuvant[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cuvinte")
      .select("id, titlu, continut")
      .order("creat_la", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch {
    // Supabase not configured yet, or table missing — render without content.
    return [];
  }
}

export default async function Home() {
  const cuvinte = await getCuvinte();

  return (
    <main className="flex-1">
      <section className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-sm tracking-widest uppercase text-black/50 dark:text-white/50">
            Ieromonahul
          </p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Macarie</h1>
          <p className="mt-6 text-lg text-black/70 dark:text-white/70">
            {/* TODO: înlocuiește cu un scurt cuvânt introductiv despre Ieromonahul Macarie. */}
            Un loc dedicat vieții, cuvintelor și lucrării Ieromonahului Macarie.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-semibold">Despre</h2>
        <p className="mt-4 text-black/70 dark:text-white/70">
          {/* TODO: biografie — anii de naștere/trecere la Domnul, locul nevoinței, mărturii. */}
          Conținutul acestei secțiuni urmează să fie completat.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-semibold">Cuvinte de folos</h2>
        {cuvinte.length > 0 ? (
          <ul className="mt-6 space-y-8">
            {cuvinte.map((cuvant) => (
              <li key={cuvant.id}>
                <h3 className="font-medium">{cuvant.titlu}</h3>
                <p className="mt-2 text-black/70 dark:text-white/70">
                  {cuvant.continut}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-black/50 dark:text-white/50">
            Nu sunt încă adăugate cuvinte. Acestea vor fi administrate din
            Supabase, în tabelul <code>cuvinte</code>.
          </p>
        )}
      </section>
    </main>
  );
}
