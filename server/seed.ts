/**
 * PNSP — Seed de produção
 * Popula o banco com dados realistas do ecossistema samba/pagode brasileiro.
 * Uso: pnpm db:seed
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  profiles,
  studios,
  offerings,
  opportunities,
  academyContent,
  financialRecords,
  notifications,
  platformMetrics,
  opportunityApplications,
} from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL ausente no .env");

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

// ─── helpers ──────────────────────────────────────────────────────────────────
function slug(name: string, suffix?: string | number): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return suffix ? `${base}-${suffix}` : base;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱  Iniciando seed PNSP...\n");

  // ── limpa em ordem segura ────────────────────────────────────────────────────
  console.log("🗑   Limpando dados existentes...");
  await db.delete(platformMetrics);
  await db.delete(notifications);
  await db.delete(opportunityApplications);
  await db.delete(financialRecords);
  await db.delete(academyContent);
  await db.delete(opportunities);
  await db.delete(offerings);
  await db.delete(studios);
  await db.delete(profiles);
  await db.delete(users);
  console.log("    ✓ Limpeza concluída\n");

  // ── users ────────────────────────────────────────────────────────────────────
  console.log("👤  Inserindo usuários (15)...");
  const [u] = await db
    .insert(users)
    .values([
      { openId: "owner-danilo-pnsp-001", name: "Danilo Alves", email: "danilo@pnsp.com.br", role: "owner", loginMethod: "manus", lastSignedIn: new Date() },
      { openId: "admin-carolina-pnsp-002", name: "Carolina Ferreira", email: "carolina@pnsp.com.br", role: "admin", loginMethod: "manus", lastSignedIn: new Date() },
      { openId: "user-marcelo-003", name: "Marcelo Santos", email: "marcelo@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(2) },
      { openId: "user-ana-004", name: "Ana Lima", email: "ana@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(3) },
      { openId: "user-roberto-005", name: "Roberto Freitas", email: "roberto@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(5) },
      { openId: "user-juliana-006", name: "Juliana Nunes", email: "juliana@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(7) },
      { openId: "user-paulo-007", name: "Paulo Henrique Costa", email: "paulo@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(4) },
      { openId: "user-fernanda-008", name: "Fernanda Oliveira", email: "fernanda@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(6) },
      { openId: "user-ricardo-009", name: "Ricardo Melo", email: "ricardo@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(8) },
      { openId: "user-samanta-010", name: "Samanta Cruz", email: "samanta@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(10) },
      { openId: "user-thiago-011", name: "Thiago Barbosa", email: "thiago@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(12) },
      { openId: "user-claudia-012", name: "Cláudia Moraes", email: "claudia@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(15) },
      { openId: "user-eduardo-013", name: "Eduardo Sampaio", email: "eduardo@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(20) },
      { openId: "user-beatriz-014", name: "Beatriz Gomes", email: "beatriz@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(25) },
      { openId: "user-leandro-015", name: "Leandro Pinto", email: "leandro@email.com", role: "user", loginMethod: "manus", lastSignedIn: daysAgo(30) },
    ])
    .returning({ id: users.id });
  const allUsers = await db.select({ id: users.id }).from(users);
  const uid = (i: number) => allUsers[i]?.id ?? allUsers[2].id;
  console.log(`    ✓ ${allUsers.length} usuários criados\n`);

  // ── profiles (50) ────────────────────────────────────────────────────────────
  console.log("🎭  Inserindo perfis (50)...");
  const profileData = [
    // artista_solo (18)
    { userId: uid(2),  profileType: "artista_solo" as const, displayName: "Marcelo Santos", slug: slug("Marcelo Santos", 1), city: "Rio de Janeiro", state: "RJ", bio: "Sambista carioca de alma. Cantor e compositor com 15 anos de estrada, autor de clássicos do pagode raiz.", specialties: ["Canto", "Composição", "Violão"], genres: ["Samba", "Pagode"], instruments: ["Violão", "Cavaquinho"], isVerified: true, isFeatured: true, status: "active" as const },
    { userId: uid(3),  profileType: "artista_solo" as const, displayName: "Ana Lima", slug: slug("Ana Lima", 2), city: "Salvador", state: "BA", bio: "Cantora baiana com raízes no samba de roda do Recôncavo. Voz grave e marcante, mescla tradição e modernidade.", specialties: ["Canto", "Samba de Roda"], genres: ["Samba de Roda", "Pagode"], instruments: ["Pandeiro"], isVerified: true, isFeatured: true, status: "active" as const },
    { userId: uid(4),  profileType: "artista_solo" as const, displayName: "Roberto Freitas", slug: slug("Roberto Freitas", 3), city: "São Paulo", state: "SP", bio: "Percussionista paulistano, referência em pandeiro. Formado na Escola Municipal de Música de São Paulo.", specialties: ["Percussão", "Pandeiro"], genres: ["Samba", "Pagode", "Samba-Jazz"], instruments: ["Pandeiro", "Surdo", "Tamborim"], isVerified: true, status: "active" as const },
    { userId: uid(5),  profileType: "artista_solo" as const, displayName: "Juliana Nunes", slug: slug("Juliana Nunes", 4), city: "Belo Horizonte", state: "MG", bio: "Mineira apaixonada pelo samba. Cantora e compositora, vencedora do Prêmio Mineiro de Samba 2022.", specialties: ["Canto", "Composição"], genres: ["Samba", "MPB"], instruments: ["Pandeiro", "Violão"], isFeatured: true, status: "active" as const },
    { userId: uid(6),  profileType: "artista_solo" as const, displayName: "Paulo Henrique Costa", slug: slug("Paulo Henrique Costa", 5), city: "Rio de Janeiro", state: "RJ", bio: "Cavaquinista virtuoso da Portela. Tocou com os maiores nomes do samba carioca.", specialties: ["Cavaquinho", "Arranjo"], genres: ["Samba", "Choro"], instruments: ["Cavaquinho", "Violão 7 cordas"], isVerified: true, status: "active" as const },
    { userId: uid(7),  profileType: "artista_solo" as const, displayName: "Fernanda Oliveira", slug: slug("Fernanda Oliveira", 6), city: "São Paulo", state: "SP", bio: "Compositora e intérprete com foco em pagode romântico. Mais de 100 músicas gravadas por grandes artistas.", specialties: ["Composição", "Canto"], genres: ["Pagode", "Samba"], instruments: ["Violão"], status: "active" as const },
    { userId: uid(8),  profileType: "artista_solo" as const, displayName: "Ricardo Melo", slug: slug("Ricardo Melo", 7), city: "Curitiba", state: "PR", bio: "Banjoísta e violonista paranaense, um dos pioneiros do pagode no sul do Brasil.", specialties: ["Banjo", "Violão"], genres: ["Pagode", "Samba"], instruments: ["Banjo", "Violão", "Cavaquinho"], status: "active" as const },
    { userId: uid(9),  profileType: "artista_solo" as const, displayName: "Samanta Cruz", slug: slug("Samanta Cruz", 8), city: "Recife", state: "PE", bio: "Artista pernambucana que mistura samba com influências nordestinas. Coco de roda, ciranda e pagode em um só show.", specialties: ["Canto", "Dança"], genres: ["Samba", "Coco", "Ciranda"], instruments: ["Pandeiro", "Ganzá"], status: "active" as const },
    { userId: uid(10), profileType: "artista_solo" as const, displayName: "Thiago Barbosa", slug: slug("Thiago Barbosa", 9), city: "Rio de Janeiro", state: "RJ", bio: "Tamborineiro e ritmista da Mangueira. Referência nacional em bateria de escola de samba.", specialties: ["Tamborim", "Percussão"], genres: ["Samba-Enredo", "Samba"], instruments: ["Tamborim", "Repique", "Surdo"], isVerified: true, status: "active" as const },
    { userId: uid(11), profileType: "artista_solo" as const, displayName: "Cláudia Moraes", slug: slug("Claudia Moraes", 10), city: "Salvador", state: "BA", bio: "Cantora e percussionista, referência no samba de roda do Iguape. Patrimônio Cultural do Estado da Bahia.", specialties: ["Canto", "Percussão"], genres: ["Samba de Roda", "Ijexá"], instruments: ["Atabaque", "Agogô"], isVerified: true, isFeatured: true, status: "active" as const },
    { userId: uid(12), profileType: "artista_solo" as const, displayName: "Eduardo Sampaio", slug: slug("Eduardo Sampaio", 11), city: "Porto Alegre", state: "RS", bio: "Violonista e compositor gaúcho com projeto de levar o samba ao extremo sul do Brasil.", specialties: ["Violão 7 cordas", "Composição"], genres: ["Samba", "Choro"], instruments: ["Violão 7 cordas", "Violão 6 cordas"], status: "active" as const },
    { userId: uid(13), profileType: "artista_solo" as const, displayName: "Beatriz Gomes", slug: slug("Beatriz Gomes", 12), city: "Vitória", state: "ES", bio: "Cantora capixaba com forte influência no pagode romântico capixaba. Dona de uma voz doce e marcante.", specialties: ["Canto"], genres: ["Pagode Romântico", "Samba"], instruments: ["Pandeiro"], status: "active" as const },
    { userId: uid(14), profileType: "artista_solo" as const, displayName: "Leandro Pinto", slug: slug("Leandro Pinto", 13), city: "Belo Horizonte", state: "MG", bio: "Compositor e cantor mineiro. Seu samba de mesa é um show à parte.", specialties: ["Composição", "Canto", "Violão"], genres: ["Samba de Mesa", "Pagode"], instruments: ["Violão", "Pandeiro"], status: "active" as const },
    { userId: uid(2),  profileType: "artista_solo" as const, displayName: "Daniela Neves", slug: slug("Daniela Neves", 14), city: "Rio de Janeiro", state: "RJ", bio: "Percussionista e dançarina carioca. Especialista em dança de samba e coreografia para shows.", specialties: ["Dança", "Percussão"], genres: ["Samba", "Samba de Gafieira"], instruments: ["Pandeiro"], status: "active" as const },
    { userId: uid(3),  profileType: "artista_solo" as const, displayName: "Caio Souza", slug: slug("Caio Souza", 15), city: "Fortaleza", state: "CE", bio: "Cantor e compositor cearense, referência no samba cearense e no baião de roda.", specialties: ["Canto", "Composição"], genres: ["Samba", "Baião"], instruments: ["Violão", "Pandeiro"], status: "active" as const },
    { userId: uid(4),  profileType: "artista_solo" as const, displayName: "Mariana Figueiredo", slug: slug("Mariana Figueiredo", 16), city: "São Paulo", state: "SP", bio: "Pianista e arranjadora de samba-jazz. Formada em piano clássico, encontrou no samba seu grande amor.", specialties: ["Piano", "Arranjo", "Samba-Jazz"], genres: ["Samba-Jazz", "Samba"], instruments: ["Piano", "Teclado"], isVerified: true, status: "active" as const },
    { userId: uid(5),  profileType: "artista_solo" as const, displayName: "Jonas Pereira", slug: slug("Jonas Pereira", 17), city: "Brasília", state: "DF", bio: "Vocalista e DJ de pagode eletrônico, misturando tradição e modernidade nas festas de Brasília.", specialties: ["Canto", "DJ"], genres: ["Pagode", "Samba Pop"], instruments: ["Pandeiro", "Timbal"], status: "active" as const },
    { userId: uid(6),  profileType: "artista_solo" as const, displayName: "Sandra Albuquerque", slug: slug("Sandra Albuquerque", 18), city: "Manaus", state: "AM", bio: "Sambista do Norte, levando o samba às margens do Amazonas.", specialties: ["Canto", "Composição"], genres: ["Samba", "Carimbó"], instruments: ["Violão", "Pandeiro"], status: "active" as const },

    // grupo_banda (8)
    { userId: uid(7),  profileType: "grupo_banda" as const, displayName: "Raízes do Morro", slug: slug("Raizes do Morro", 19), city: "Rio de Janeiro", state: "RJ", bio: "Grupo de samba raiz formado em 1998 no Morro da Serrinha. Referência no samba carioca com mais de 20 anos de estrada.", specialties: ["Samba Raiz", "Show", "Gravação"], genres: ["Samba", "Samba de Roda"], instruments: ["Pandeiro", "Cavaquinho", "Violão 7 cordas", "Tamborim"], isVerified: true, isFeatured: true, status: "active" as const },
    { userId: uid(8),  profileType: "grupo_banda" as const, displayName: "Pagode do Bem", slug: slug("Pagode do Bem", 20), city: "São Paulo", state: "SP", bio: "Grupo de pagode paulistano com 7 integrantes. Shows animados e repertório que vai do pagode clássico ao mais atual.", specialties: ["Show", "Eventos Corporativos"], genres: ["Pagode", "Samba"], instruments: ["Banjo", "Pandeiro", "Tantã", "Repique de mão"], isFeatured: true, status: "active" as const },
    { userId: uid(9),  profileType: "grupo_banda" as const, displayName: "Roda de Samba da Lapa", slug: slug("Roda de Samba da Lapa", 21), city: "Rio de Janeiro", state: "RJ", bio: "Roda de samba tradicional na Lapa carioca. Toda sexta-feira, o melhor do samba ao vivo.", specialties: ["Roda de Samba", "Show", "Eventos"], genres: ["Samba", "Partido Alto", "Samba Enredo"], instruments: ["Pandeiro", "Cavaquinho", "Surdo"], status: "active" as const },
    { userId: uid(10), profileType: "grupo_banda" as const, displayName: "Grupo Melhor de Dois", slug: slug("Grupo Melhor de Dois", 22), city: "Salvador", state: "BA", bio: "Duo de pagode baiano com estilo único, misturando axé e pagode romântico.", specialties: ["Show", "Gravação", "Eventos"], genres: ["Pagode Baiano", "Pagode Romântico"], instruments: ["Cavaquinho", "Pandeiro"], status: "active" as const },
    { userId: uid(11), profileType: "grupo_banda" as const, displayName: "Fundo de Quintal Jr.", slug: slug("Fundo de Quintal Jr", 23), city: "Rio de Janeiro", state: "RJ", bio: "Grupo carioca herdeiro da tradição do Fundo de Quintal. Jovens talentos mantendo o pagode raiz vivo.", specialties: ["Show", "Gravação"], genres: ["Pagode", "Samba"], instruments: ["Bandolim", "Repique de mão", "Tantã", "Pandeiro"], isVerified: true, status: "active" as const },
    { userId: uid(12), profileType: "grupo_banda" as const, displayName: "Samba do Cerrado", slug: slug("Samba do Cerrado", 24), city: "Brasília", state: "DF", bio: "Grupo de samba brasiliense com 5 integrantes. Representam o samba no coração do cerrado.", specialties: ["Show", "Eventos"], genres: ["Samba", "Pagode"], instruments: ["Violão", "Pandeiro", "Tamborim", "Cavaquinho"], status: "active" as const },
    { userId: uid(13), profileType: "grupo_banda" as const, displayName: "Boteco do Samba", slug: slug("Boteco do Samba", 25), city: "Belo Horizonte", state: "MG", bio: "Grupo mineiro com show de boteco autêntico: samba, pagode e muita emoção.", specialties: ["Show", "Bar"], genres: ["Samba", "Pagode de Mesa"], instruments: ["Pandeiro", "Cavaquinho", "Violão 7 cordas"], status: "active" as const },
    { userId: uid(14), profileType: "grupo_banda" as const, displayName: "Pagode Sul", slug: slug("Pagode Sul", 26), city: "Porto Alegre", state: "RS", bio: "Pioneiros do pagode gaúcho. 10 anos levando o ritmo ao extremo sul do país.", specialties: ["Show", "Eventos"], genres: ["Pagode", "Samba"], instruments: ["Banjo", "Pandeiro", "Tantã"], status: "active" as const },

    // comunidade_roda (4)
    { userId: uid(2),  profileType: "comunidade_roda" as const, displayName: "Roda do Estácio", slug: slug("Roda do Estacio", 27), city: "Rio de Janeiro", state: "RJ", bio: "Roda de samba do berço do samba carioca. Toda segunda-feira, no Estácio.", specialties: ["Roda de Samba", "Tradição"], genres: ["Samba Raiz", "Partido Alto"], instruments: ["Pandeiro", "Cavaquinho", "Violão 7 cordas"], isVerified: true, status: "active" as const },
    { userId: uid(3),  profileType: "comunidade_roda" as const, displayName: "Terreiro Samba do Recôncavo", slug: slug("Terreiro Samba Reconcavo", 28), city: "Santo Amaro", state: "BA", bio: "Espaço cultural dedicado à preservação do samba de roda do Recôncavo Baiano, Patrimônio Cultural Imaterial da Humanidade.", specialties: ["Samba de Roda", "Cultura", "Formação"], genres: ["Samba de Roda", "Chula"], isVerified: true, isFeatured: true, status: "active" as const },
    { userId: uid(4),  profileType: "comunidade_roda" as const, displayName: "Samba da Vela", slug: slug("Samba da Vela", 29), city: "São Paulo", state: "SP", bio: "Encontro mensal de samba raiz na zona leste paulistana. 15 anos de tradição.", specialties: ["Roda de Samba", "Evento Mensal"], genres: ["Samba", "Pagode"], status: "active" as const },
    { userId: uid(5),  profileType: "comunidade_roda" as const, displayName: "Pagode da 27", slug: slug("Pagode da 27", 30), city: "Belo Horizonte", state: "MG", bio: "Roda de pagode semanal na 27 de março. A mais tradicional de BH.", specialties: ["Roda de Pagode", "Encontros Semanais"], genres: ["Pagode", "Samba"], status: "active" as const },

    // produtor (5)
    { userId: uid(6),  profileType: "produtor" as const, displayName: "Studio Produções Carioca", slug: slug("Studio Producoes Carioca", 31), city: "Rio de Janeiro", state: "RJ", bio: "Produtora musical com 20 anos de mercado. Especializada em samba, pagode e MPB. Mais de 200 álbuns produzidos.", specialties: ["Produção Musical", "Mixagem", "Mastering"], genres: ["Samba", "Pagode", "MPB"], isVerified: true, isFeatured: true, status: "active" as const },
    { userId: uid(7),  profileType: "produtor" as const, displayName: "Paulo Malandro Produções", slug: slug("Paulo Malandro Producoes", 32), city: "São Paulo", state: "SP", bio: "Produtor independente especializado em lançamentos digitais para artistas de samba e pagode.", specialties: ["Produção Digital", "Distribuição", "Marketing Musical"], genres: ["Pagode", "Samba"], status: "active" as const },
    { userId: uid(8),  profileType: "produtor" as const, displayName: "Canarinho Sound", slug: slug("Canarinho Sound", 33), city: "Salvador", state: "BA", bio: "Produtor baiano com pegada única. Une o samba de roda ao trap e ao funk para criar algo novo.", specialties: ["Produção", "Arranjo Contemporâneo"], genres: ["Samba de Roda", "Pagode Moderno"], status: "active" as const },
    { userId: uid(9),  profileType: "produtor" as const, displayName: "MG Beats Produção", slug: slug("MG Beats Producao", 34), city: "Belo Horizonte", state: "MG", bio: "Produtora mineira focada em pagode de mesa e samba tradicional. Gravações em estúdio próprio.", specialties: ["Produção", "Gravação", "Mixagem"], genres: ["Pagode", "Samba"], status: "active" as const },
    { userId: uid(10), profileType: "produtor" as const, displayName: "Samba Corp Brasil", slug: slug("Samba Corp Brasil", 35), city: "Rio de Janeiro", state: "RJ", bio: "Maior produtora independente de samba do Brasil. Gestão de carreira, shows, mídia e distribuição.", specialties: ["Gestão Artística", "Shows", "Distribuição"], genres: ["Samba", "Pagode"], isVerified: true, status: "active" as const },

    // estudio (3)
    { userId: uid(11), profileType: "estudio" as const, displayName: "Estúdio Bambu Recording", slug: slug("Estudio Bambu Recording", 36), city: "Rio de Janeiro", state: "RJ", bio: "Estúdio de gravação especializado em samba e MPB. Salas acústicas tratadas, equipamentos vintage e modernos.", specialties: ["Gravação", "Mixagem", "Mastering"], instruments: ["Piano de cauda", "Hammond", "Mellotron"], isVerified: true, status: "active" as const },
    { userId: uid(12), profileType: "estudio" as const, displayName: "Palco D'África Studio", slug: slug("Palco Africa Studio", 37), city: "Salvador", state: "BA", bio: "Estúdio com acústica especial para percussão afro-brasileira e samba de roda.", specialties: ["Percussão", "Instrumentos Afro", "Gravação ao Vivo"], status: "active" as const },
    { userId: uid(13), profileType: "estudio" as const, displayName: "Metrô Records SP", slug: slug("Metro Records SP", 38), city: "São Paulo", state: "SP", bio: "Estúdio boutique em Pinheiros. Especializado em captação ao vivo com som vintage.", specialties: ["Gravação Analógica", "Mixagem"], isVerified: true, status: "active" as const },

    // professor (5)
    { userId: uid(14), profileType: "professor" as const, displayName: "Escola Pandeiro Brasil", slug: slug("Escola Pandeiro Brasil", 39), city: "Rio de Janeiro", state: "RJ", bio: "Escola especializada em pandeiro. Cursos presenciais e online do iniciante ao avançado.", specialties: ["Pandeiro", "Percussão", "Didática"], instruments: ["Pandeiro"], isVerified: true, status: "active" as const },
    { userId: uid(2),  profileType: "professor" as const, displayName: "Mestre Cavaquinho", slug: slug("Mestre Cavaquinho", 40), city: "São Paulo", state: "SP", bio: "20 anos ensinando cavaquinho. Método próprio com mais de 5.000 alunos formados.", specialties: ["Cavaquinho", "Harmonia", "Teoria Musical"], instruments: ["Cavaquinho"], isFeatured: true, status: "active" as const },
    { userId: uid(3),  profileType: "professor" as const, displayName: "Ritmistas da Bahia", slug: slug("Ritmistas da Bahia", 41), city: "Salvador", state: "BA", bio: "Escola de percussão afro-brasileira. Atabaque, agogô, tamborim e pandeiro.", specialties: ["Percussão Afro", "Atabaque", "Tamborim"], instruments: ["Atabaque", "Agogô", "Tamborim"], status: "active" as const },
    { userId: uid(4),  profileType: "professor" as const, displayName: "Instituto Samba Vivo", slug: slug("Instituto Samba Vivo", 42), city: "Rio de Janeiro", state: "RJ", bio: "Instituto de formação musical com foco em samba. Bolsas para comunidades carentes.", specialties: ["Formação Musical", "Canto", "Instrumentos de Samba"], isVerified: true, status: "active" as const },
    { userId: uid(5),  profileType: "professor" as const, displayName: "Violão do Samba", slug: slug("Violao do Samba", 43), city: "Belo Horizonte", state: "MG", bio: "Professor de violão especializado no acompanhamento de samba. Turmas presenciais em BH e cursos online.", specialties: ["Violão 7 cordas", "Violão Samba", "Harmonia"], instruments: ["Violão 7 cordas", "Violão 6 cordas"], status: "active" as const },

    // loja (4)
    { userId: uid(6),  profileType: "loja" as const, displayName: "Pandeiro.com.br", slug: slug("Pandeiro.com.br", 44), city: "Rio de Janeiro", state: "RJ", bio: "A maior loja especializada em pandeiros do Brasil. Peças nacionais e importadas, couro e sintético.", specialties: ["Pandeiros", "Acessórios", "Conserto"], isVerified: true, status: "active" as const },
    { userId: uid(7),  profileType: "loja" as const, displayName: "Casa do Cavaquinho", slug: slug("Casa do Cavaquinho", 45), city: "São Paulo", state: "SP", bio: "Loja especializada em cavaquinho e instrumentos de cordas para samba. 30 anos de tradição.", specialties: ["Cavaquinho", "Banjo", "Violão"], isVerified: true, isFeatured: true, status: "active" as const },
    { userId: uid(8),  profileType: "loja" as const, displayName: "Percussão Nordeste", slug: slug("Percussao Nordeste", 46), city: "Recife", state: "PE", bio: "Loja especializada em instrumentos de percussão nordestinos e afro-brasileiros.", specialties: ["Percussão", "Instrumentos Nordestinos"], status: "active" as const },
    { userId: uid(9),  profileType: "loja" as const, displayName: "Ritmo & Compasso", slug: slug("Ritmo e Compasso", 47), city: "Belo Horizonte", state: "MG", bio: "Multi-loja de instrumentos musicais focada em samba e pagode. Instrumentos, partituras e acessórios.", specialties: ["Instrumentos Samba", "Partituras", "Acessórios"], status: "active" as const },

    // luthier (2)
    { userId: uid(10), profileType: "luthier" as const, displayName: "Luthier Cavaquinho Artesanal", slug: slug("Luthier Cavaquinho Artesanal", 48), city: "Rio de Janeiro", state: "RJ", bio: "Fabricação e restauração artesanal de cavaquinhos. 30 anos de ofício. Instrumentos únicos, feitos à mão.", specialties: ["Fabricação Cavaquinho", "Restauração", "Reparo"], instruments: ["Cavaquinho", "Banjo", "Bandolim"], isVerified: true, isFeatured: true, status: "active" as const },
    { userId: uid(11), profileType: "luthier" as const, displayName: "Pandeiro Artesanal Telas", slug: slug("Pandeiro Artesanal Telas", 49), city: "Salvador", state: "BA", bio: "Fabricação de pandeiros artesanais com couro natural e platinelas de latão. Encomendas para todo o Brasil.", specialties: ["Fabricação Pandeiro", "Couro", "Personalização"], instruments: ["Pandeiro"], status: "active" as const },

    // contratante (1)
    { userId: uid(12), profileType: "contratante" as const, displayName: "Eventos Samba Live", slug: slug("Eventos Samba Live", 50), city: "São Paulo", state: "SP", bio: "Agência de contratação e produção de eventos focada em samba e pagode. Festas corporativas, casamentos e eventos culturais.", specialties: ["Produção de Eventos", "Contratação Artística", "Shows"], isVerified: true, status: "active" as const },
  ];

  await db.insert(profiles).values(
    profileData.map((p) => ({
      ...p,
      isActive: true,
      isVerified: p.isVerified ?? false,
      isFeatured: p.isFeatured ?? false,
      specialties: p.specialties ?? null,
      instruments: (p as Record<string, unknown>).instruments as string[] ?? null,
      genres: (p as Record<string, unknown>).genres as string[] ?? null,
    }))
  );
  const allProfiles = await db.select({ id: profiles.id, userId: profiles.userId }).from(profiles);
  const pid = (i: number) => allProfiles[i]?.id ?? allProfiles[0].id;
  console.log(`    ✓ ${allProfiles.length} perfis criados\n`);

  // ── studios (12) ────────────────────────────────────────────────────────────
  console.log("🎙   Inserindo estúdios (12)...");
  await db.insert(studios).values([
    { userId: uid(2),  name: "Bambu Studio RJ", slug: slug("Bambu Studio RJ"), description: "Estúdio premium no coração da Lapa carioca. Especializado em samba e MPB. Piano de cauda Steinway, mesa SSL e microfones vintage.", city: "Rio de Janeiro", state: "RJ", studioType: "gravacao", pricePerHour: "250", pricePerDay: "1800", capacity: 12, isVerified: true, isActive: true, status: "active", rating: "4.90", equipment: ["SSL 4000", "Pro Tools HD", "Piano Steinway", "Neumann U87", "Vintage 1176"], amenities: ["Sala de controle", "Sala ao vivo", "Copa", "Ar condicionado", "Estacionamento"] },
    { userId: uid(3),  name: "Casa do Pagode SP", slug: slug("Casa do Pagode SP"), description: "O melhor estúdio para pagode em São Paulo. Sala de ensaio acústica e gravação em formatos analógico e digital.", city: "São Paulo", state: "SP", studioType: "ambos", pricePerHour: "180", pricePerDay: "1200", capacity: 15, isVerified: true, isActive: true, status: "active", rating: "4.75", equipment: ["Pro Tools", "API Console", "Drums Kit", "Bandolim Hofner"], amenities: ["Sala de ensaio", "Gravação", "Copa", "WiFi"] },
    { userId: uid(4),  name: "Estúdio Afro Salvador", slug: slug("Estudio Afro Salvador"), description: "Referência em gravação de percussão afro-brasileira e samba de roda em Salvador. Acústica projetada especialmente para instrumentos de percussão.", city: "Salvador", state: "BA", studioType: "gravacao", pricePerHour: "150", pricePerDay: "900", capacity: 10, isVerified: true, isActive: true, status: "active", rating: "4.80", equipment: ["Neve 8078", "Pro Tools", "Atabaques profissionais", "DI Box"], amenities: ["Sala de percussão", "Controle", "Copa", "Wifi"] },
    { userId: uid(5),  name: "Studio Mineiro BH", slug: slug("Studio Mineiro BH"), description: "Estúdio de referência em Belo Horizonte para gravação de samba, MPB e pagode de mesa.", city: "Belo Horizonte", state: "MG", studioType: "ambos", pricePerHour: "140", pricePerDay: "850", capacity: 8, isVerified: true, isActive: true, status: "active", rating: "4.60", equipment: ["Focusrite Rednet", "Logic Pro", "Mesa de 32 canais"], amenities: ["Sala de gravação", "Copa", "Ar condicionado"] },
    { userId: uid(6),  name: "Lapa Music Studio", slug: slug("Lapa Music Studio"), description: "Estúdio de ensaio e gravação na Lapa, RJ. Especializado em formatos ao vivo para samba.", city: "Rio de Janeiro", state: "RJ", studioType: "ensaio", pricePerHour: "80", pricePerDay: "500", capacity: 20, isActive: true, status: "active", rating: "4.50", equipment: ["Sistema de PA", "Monitores ativos", "Bateria acústica"], amenities: ["Sala de ensaio grande", "Bebedouro", "Vestiário"] },
    { userId: uid(7),  name: "Sala de Ensaio Carioca", slug: slug("Sala de Ensaio Carioca"), description: "Salas de ensaio acessíveis para grupos de samba e pagode no centro do Rio.", city: "Rio de Janeiro", state: "RJ", studioType: "ensaio", pricePerHour: "60", pricePerDay: "350", capacity: 10, isActive: true, status: "active", rating: "4.30", equipment: ["Bateria", "Amplificadores", "PA básico"], amenities: ["Múltiplas salas", "Copa", "Segurança 24h"] },
    { userId: uid(8),  name: "Ritmo Sur Porto Alegre", slug: slug("Ritmo Sur Porto Alegre"), description: "Estúdio gaúcho com infraestrutura completa. O melhor do sul para gravação de samba.", city: "Porto Alegre", state: "RS", studioType: "ambos", pricePerHour: "120", pricePerDay: "700", capacity: 8, isActive: true, status: "active", rating: "4.40", equipment: ["Apollo Twin", "Logic Pro", "Violões de estúdio"], amenities: ["Sala de controle", "Cabines isoladas", "Lounge"] },
    { userId: uid(9),  name: "Nordeste Groove Recife", slug: slug("Nordeste Groove Recife"), description: "Estúdio pernambucano que une samba e ritmos nordestinos. Referência no Nordeste.", city: "Recife", state: "PE", studioType: "gravacao", pricePerHour: "110", pricePerDay: "650", capacity: 10, isVerified: true, isActive: true, status: "active", rating: "4.65", equipment: ["SSL", "Pro Tools", "Zabumba", "Triângulo"], amenities: ["Sala de gravação", "Copa", "WiFi"] },
    { userId: uid(10), name: "Capital Samba Brasília", slug: slug("Capital Samba Brasilia"), description: "O principal estúdio de samba do DF. Gravação e ensaio para artistas do Planalto Central.", city: "Brasília", state: "DF", studioType: "ambos", pricePerHour: "160", pricePerDay: "950", capacity: 12, isActive: true, status: "active", rating: "4.45", equipment: ["Pro Tools", "Mesa API", "Monitores Genelec"], amenities: ["Sala de controle", "Sala ao vivo", "Copa"] },
    { userId: uid(11), name: "Estúdio Carioca Virtual", slug: slug("Estudio Carioca Virtual"), description: "Estúdio híbrido com gravação presencial e remota. Grave seu samba de qualquer lugar do Brasil.", city: "Rio de Janeiro", state: "RJ", studioType: "gravacao", pricePerHour: "200", pricePerDay: "1400", capacity: 6, isVerified: true, isActive: true, status: "active", rating: "4.70", equipment: ["Pro Tools Ultimate", "Dante Network", "Microfones Neumann"], amenities: ["Sessões remotas", "Mix online", "Entrega digital"] },
    { userId: uid(12), name: "Capixaba Sound Vitória", slug: slug("Capixaba Sound Vitoria"), description: "Estúdio de gravação e ensaio em Vitória, ES. Servindo a cena musical capixaba há 10 anos.", city: "Vitória", state: "ES", studioType: "ambos", pricePerHour: "100", pricePerDay: "600", capacity: 8, isActive: true, status: "active", rating: "4.20", equipment: ["Apollo x8p", "Studio One", "Bateria e contrabaixo de estúdio"], amenities: ["Sala de ensaio", "Gravação", "Copa"] },
    { userId: uid(13), name: "Samba Lab Fortaleza", slug: slug("Samba Lab Fortaleza"), description: "Laboratório musical especializado em samba cearense e ritmos regionais.", city: "Fortaleza", state: "CE", studioType: "ambos", pricePerHour: "90", pricePerDay: "550", capacity: 8, isActive: true, status: "active", rating: "4.35", equipment: ["Focusrite 18i20", "Ableton Live", "Percussão nordestina"], amenities: ["Sala de ensaio", "Gravação", "WiFi", "Copa"] },
  ]);
  const allStudios = await db.select({ id: studios.id }).from(studios);
  console.log(`    ✓ ${allStudios.length} estúdios criados\n`);

  // ── offerings (30) ──────────────────────────────────────────────────────────
  console.log("🎵  Inserindo ofertas (30)...");
  await db.insert(offerings).values([
    { userId: uid(2),  profileId: pid(0),  title: "Show de Samba Raiz para Eventos", category: "show", priceType: "sob_consulta", description: "Show completo de samba raiz com banda de 6 músicos. Repertório clássico e autoral. Ideal para eventos corporativos, casamentos e festivais.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["samba", "show", "evento", "banda"] },
    { userId: uid(3),  profileId: pid(1),  title: "Show de Cantora Baiana — Samba de Roda", category: "show", priceType: "sob_consulta", description: "Show de 60 a 90 minutos de samba de roda baiano. Figurino típico, percussão ao vivo e dança. Perfeito para festivais culturais.", city: "Salvador", state: "BA", status: "active", isActive: true, tags: ["samba de roda", "bahia", "show"] },
    { userId: uid(6),  profileId: pid(18), title: "Show Grupo Pagode do Bem — 2h", category: "show", priceType: "fixo", price: "4500", description: "Show de 2 horas do Pagode do Bem para sua festa. Repertório animado, grupo de 7 músicos.", city: "São Paulo", state: "SP", status: "active", isActive: true, isPremium: true, tags: ["pagode", "show", "festa", "grupo"] },
    { userId: uid(7),  profileId: pid(19), title: "Roda de Samba ao Vivo — Lapa RJ", category: "show", priceType: "fixo", price: "3000", description: "Roda de samba tradicional ao vivo para bares, restaurantes e eventos. Mínimo 3h.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["roda de samba", "ao vivo", "bar"] },
    { userId: uid(8),  profileId: pid(22), title: "Show Fundo de Quintal Jr — Pagode Raiz", category: "show", priceType: "sob_consulta", description: "Show do Fundo de Quintal Jr para eventos premium. Pagode raiz da mais alta qualidade.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, isPremium: true, tags: ["pagode raiz", "show premium", "fundo de quintal"] },
    // aula
    { userId: uid(4),  profileId: pid(2),  title: "Aulas de Pandeiro — Iniciante ao Avançado", category: "aula", priceType: "fixo", price: "120", description: "Aulas semanais de pandeiro com Roberto Freitas. Iniciante, intermediário ou avançado. Presencial ou online.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["pandeiro", "aula", "percussão"] },
    { userId: uid(6),  profileId: pid(4),  title: "Aulas de Cavaquinho — Método Paulo Henrique", category: "aula", priceType: "fixo", price: "150", description: "Método exclusivo de cavaquinho de Paulo Henrique Costa. Aprenda do zero ao profissional.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["cavaquinho", "aula", "método"] },
    { userId: uid(14), profileId: pid(37), title: "Curso de Pandeiro — Escola Pandeiro Brasil", category: "aula", priceType: "fixo", price: "200", description: "Curso mensal de pandeiro. 4 aulas por mês, material incluso, certificado ao final.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["pandeiro", "curso", "escola"] },
    { userId: uid(2),  profileId: pid(38), title: "Aula de Cavaquinho Online — Mestre Cavaquinho", category: "aula", priceType: "fixo", price: "100", description: "Aula online por videochamada. Horários flexíveis. Cavaquinho básico ao avançado em 12 meses.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["cavaquinho", "online", "aula"] },
    { userId: uid(5),  profileId: pid(41), title: "Oficina de Percussão Afro — Ritmistas da Bahia", category: "aula", priceType: "fixo", price: "180", description: "Oficina de percussão afro-brasileira para grupos ou indivíduos. Atabaque, tamborim, agogô.", city: "Salvador", state: "BA", status: "active", isActive: true, tags: ["percussão afro", "atabaque", "oficina"] },
    // producao
    { userId: uid(6),  profileId: pid(29), title: "Produção Musical Completa — Samba e Pagode", category: "producao", priceType: "sob_consulta", description: "Produção completa: composição, arranjo, gravação, mixagem e mastering. Entrega em até 30 dias.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, isPremium: true, tags: ["produção musical", "samba", "arranjo"] },
    { userId: uid(7),  profileId: pid(30), title: "Lançamento Digital — Distribuição em 180 Plataformas", category: "producao", priceType: "fixo", price: "800", description: "Lançamento da sua música em todas as plataformas digitais. Spotify, Apple Music, YouTube Music e mais.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["distribuição digital", "lançamento", "streaming"] },
    { userId: uid(11), profileId: pid(34), title: "Mix e Mastering para Samba — Entrega em 72h", category: "producao", priceType: "fixo", price: "350", description: "Mixagem e mastering profissional para samba e pagode. Até 8 faixas por pacote.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["mix", "mastering", "samba"] },
    // instrumento_novo
    { userId: uid(6),  profileId: pid(42), title: "Pandeiro Profissional 10\" — Couro Natural", category: "instrumento_novo", priceType: "fixo", price: "380", description: "Pandeiro artesanal 10 polegadas com couro natural curado e platinelas de latão duplas. Para profissionais.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["pandeiro", "profissional", "couro natural"] },
    { userId: uid(7),  profileId: pid(43), title: "Cavaquinho Luthier — Cedro e Arce", category: "instrumento_novo", priceType: "fixo", price: "2200", description: "Cavaquinho artesanal com tampo de cedro e fundo/lateral em arce. Acabamento laca nitro. Encomendas.", city: "São Paulo", state: "SP", status: "active", isActive: true, isPremium: true, tags: ["cavaquinho", "luthier", "artesanal"] },
    { userId: uid(8),  profileId: pid(44), title: "Pandeiro Sílex 10\" Pele Sintética — Iniciante", category: "instrumento_novo", priceType: "fixo", price: "180", description: "Pandeiro pele sintética ideal para iniciantes. Não ressente de temperatura e umidade. Entrega em todo Brasil.", city: "Recife", state: "PE", status: "active", isActive: true, tags: ["pandeiro", "iniciante", "sintético"] },
    // instrumento_usado
    { userId: uid(9),  profileId: pid(45), title: "Cavaquinho Rozini Anos 80 — Estado Bom", category: "instrumento_usado", priceType: "fixo", price: "650", description: "Cavaquinho Rozini dos anos 80 em bom estado. Trastes nivelados, cravelhas funcionando. Retirada em BH.", city: "Belo Horizonte", state: "MG", status: "active", isActive: true, tags: ["cavaquinho", "usado", "rozini"] },
    { userId: uid(10), profileId: pid(0),  title: "Pandeiro Contemporâneo 12\" — Usado Pouco", category: "instrumento_usado", priceType: "fixo", price: "420", description: "Pandeiro contemporâneo 12 polegadas, platinelas duplas, pele sintética. Usado em 3 shows apenas.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["pandeiro", "usado", "contemporâneo"] },
    // luthieria
    { userId: uid(10), profileId: pid(46), title: "Restauração de Cavaquinho Antigo", category: "luthieria", priceType: "sob_consulta", description: "Restauração completa de cavaquinhos antigos. Troca de trastes, ajuste de ação, verniz e polimento.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["restauração", "cavaquinho", "luthier"] },
    { userId: uid(11), profileId: pid(47), title: "Fabricação de Pandeiro Artesanal Personalizado", category: "luthieria", priceType: "sob_consulta", description: "Pandeiros artesanais com gravação de nome ou arte. Couro natural de ovino. Prazo: 30 dias.", city: "Salvador", state: "BA", status: "active", isActive: true, tags: ["pandeiro", "artesanal", "personalizado"] },
    // estudio
    { userId: uid(2),  profileId: pid(35), title: "Sessão de Gravação Bambu Studio — 4h", category: "estudio", priceType: "fixo", price: "1000", description: "Sessão de gravação de 4 horas no Bambu Studio RJ. Incluí técnico de gravação e pré-mixagem.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, isPremium: true, tags: ["gravação", "estúdio", "sessão"] },
    { userId: uid(3),  profileId: pid(36), title: "Ensaio em Grupo — Casa do Pagode SP", category: "estudio", priceType: "fixo", price: "360", description: "Sala de ensaio para grupos de até 8 músicos. 4 horas de ensaio com técnico de som ao vivo.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["ensaio", "grupo", "sala de ensaio"] },
    // servico
    { userId: uid(12), profileId: pid(48), title: "Gestão de Redes Sociais para Artistas de Samba", category: "servico", priceType: "fixo", price: "900", description: "Gestão completa de Instagram, TikTok e YouTube para artistas de samba. Posts diários, stories e Reels.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["redes sociais", "marketing digital", "artista"] },
    { userId: uid(13), profileId: pid(49), title: "Agenciamento e Contratação Artística", category: "servico", priceType: "sob_consulta", description: "Agenciamento profissional para artistas de samba e pagode. Negociação de cachê, rider e contrato.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["agenciamento", "contratação", "representação"] },
    // acessorio
    { userId: uid(6),  profileId: pid(42), title: "Kit Acessórios Pandeiro — Capa + Platinela Extra", category: "acessorio", priceType: "fixo", price: "95", description: "Kit completo: capa de couro para pandeiro 10\", 1 pele reserva sintética e 1 jogo platinelas de latão.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["pandeiro", "acessórios", "capa", "platinela"] },
    { userId: uid(7),  profileId: pid(43), title: "Cordas de Aço para Cavaquinho — Pack 3 Jogos", category: "acessorio", priceType: "fixo", price: "75", description: "Pack econômico com 3 jogos de cordas de aço para cavaquinho. Calibre 09 ou 10.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["cavaquinho", "cordas", "aço"] },
    // audiovisual
    { userId: uid(8),  profileId: pid(31), title: "Clipe Musical Profissional para Samba — Pacote Básico", category: "audiovisual", priceType: "fixo", price: "3500", description: "Produção de clipe musical de 1 dia de gravação, 1 locação, cor e edição completa. Entrega em FullHD.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["clipe", "audiovisual", "videoclipe"] },
    { userId: uid(9),  profileId: pid(32), title: "Fotografia de Evento Musical — Day Use", category: "audiovisual", priceType: "fixo", price: "800", description: "Cobertura fotográfica de evento musical. 6 horas, 200 fotos editadas, entrega digital.", city: "Belo Horizonte", state: "MG", status: "active", isActive: true, tags: ["fotografia", "evento", "samba"] },
    // artesanato
    { userId: uid(10), profileId: pid(46), title: "Instrumentos Decorativos de Samba — Mini Pandeiro", category: "artesanato", priceType: "fixo", price: "45", description: "Mini pandeiro decorativo feito à mão com couro e madeira nobre. Ideal para presentes e decoração.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["artesanato", "pandeiro", "decoração"] },
    { userId: uid(11), profileId: pid(47), title: "Boneco de Barro Artesanal — Sambista Baiano", category: "artesanato", priceType: "fixo", price: "120", description: "Boneco de barro cozido representando sambista tocando pandeiro. Peça única, assinada pelo artesão.", city: "Salvador", state: "BA", status: "active", isActive: true, tags: ["artesanato", "barro", "samba", "baiano"] },
  ]);
  const allOfferings = await db.select({ id: offerings.id }).from(offerings);
  console.log(`    ✓ ${allOfferings.length} ofertas criadas\n`);

  // ── opportunities (20) ──────────────────────────────────────────────────────
  console.log("🎯  Inserindo oportunidades (20)...");
  await db.insert(opportunities).values([
    { userId: uid(12), title: "Procuramos Percussionista para Grupo de Samba", category: "vaga_grupo", requiredType: "artista_solo", description: "Grupo Raízes do Morro procura percussionista (pandeiro/tamborim) para integrar o grupo permanentemente. Experiência mínima 3 anos.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["percussão", "pandeiro", "vaga", "grupo"] },
    { userId: uid(13), title: "Vaga para Cavaquinista em Grupo de Pagode SP", category: "vaga_grupo", requiredType: "artista_solo", description: "Grupo Pagode do Bem busca cavaquinista com experiência em pagode raiz. Ensaios semanais em São Paulo.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["cavaquinho", "pagode", "vaga"] },
    { userId: uid(14), title: "Cantor(a) de Samba para Show de Casamento", category: "show", requiredType: "artista_solo", description: "Contratamos cantor(a) de samba para animação de casamento no Rio de Janeiro. Data: julho 2026. Cachê: R$2.000.", city: "Rio de Janeiro", state: "RJ", budgetMin: "1500", budgetMax: "2500", status: "active", isActive: true, tags: ["cantor", "casamento", "show"] },
    { userId: uid(2),  title: "Grupo de Pagode para Festa de Aniversário — SP", category: "show", requiredType: "grupo_banda", description: "Procuro grupo de pagode para festa de aniversário de 100 pessoas. 3h de show. Data: agosto 2026.", city: "São Paulo", state: "SP", budgetMin: "3000", budgetMax: "5000", status: "active", isActive: true, tags: ["pagode", "grupo", "festa"] },
    { userId: uid(3),  title: "Festival Samba Bahia 2026 — Artistas Solo", category: "evento", requiredType: "artista_solo", description: "Festival Samba Bahia 2026 seleciona artistas para apresentação. Inscrições abertas para todas as regiões.", city: "Salvador", state: "BA", budgetMin: "2000", budgetMax: "4000", deadline: new Date("2026-06-01"), status: "active", isActive: true, tags: ["festival", "bahia", "samba"] },
    { userId: uid(4),  title: "Projeto Samba nas Escolas — Professores", category: "projeto", requiredType: "professor", description: "Projeto social de samba nas escolas públicas do RJ. Buscamos professores de percussão, cavaquinho e canto.", city: "Rio de Janeiro", state: "RJ", budgetMin: "2500", status: "active", isActive: true, tags: ["projeto social", "escola", "professor"] },
    { userId: uid(5),  title: "Aula de Pandeiro Online — Alunos Iniciantes", category: "aula", requiredType: "professor", description: "Plataforma EAD de samba busca professor de pandeiro para gravar cursos online. Remuneração por royalty.", status: "active", isActive: true, tags: ["pandeiro", "online", "EAD", "professor"] },
    { userId: uid(6),  title: "Produção de EP 3 Faixas — Samba Autoral", category: "producao", requiredType: "produtor", description: "Cantor autoral de samba busca produtor para EP de 3 faixas. Verba disponível: R$6.000.", city: "Rio de Janeiro", state: "RJ", budgetMin: "4000", budgetMax: "6000", status: "active", isActive: true, tags: ["produção", "EP", "samba autoral"] },
    { userId: uid(7),  title: "Vaga Técnico de Som para Shows de Pagode — Tournée", category: "vaga_grupo", requiredType: "qualquer", description: "Grupo de pagode busca técnico de som para turnê nacional. 20 datas em 3 meses. Salário + diárias.", status: "active", isActive: true, tags: ["técnico de som", "tournée", "pagode"] },
    { userId: uid(8),  title: "Gravação de Videoclipe — Parceria com Clipe Estudio", category: "servico", requiredType: "qualquer", description: "Artista de samba procura produtora de vídeo para parceria em videoclipe. Permuta parcial.", city: "São Paulo", state: "SP", status: "active", isActive: true, tags: ["videoclipe", "parceria", "samba"] },
    { userId: uid(9),  title: "Parceria com Loja de Instrumentos — Endosso Artístico", category: "outro", requiredType: "artista_solo", description: "Loja de instrumentos busca artistas de samba e pagode para endosso de marca nas redes sociais.", status: "active", isActive: true, tags: ["endosso", "parceria", "loja"] },
    { userId: uid(10), title: "Compositor Parceiro — Parceria em Composições", category: "projeto", requiredType: "artista_solo", description: "Cantor consolidado de pagode busca compositor parceiro para co-autoria em álbum.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["compositor", "parceria", "álbum"] },
    { userId: uid(11), title: "Contratação Show — Bar ao Vivo BH Semanal", category: "show", requiredType: "grupo_banda", description: "Bar em BH contrata grupo ou artista de samba para shows semanais às sextas-feiras. Contrato de 6 meses.", city: "Belo Horizonte", state: "MG", budgetMin: "1200", budgetMax: "2000", status: "active", isActive: true, tags: ["bar", "show semanal", "contrato"] },
    { userId: uid(12), title: "Festival de Pagode Curitiba 2026 — Inscrições", category: "evento", requiredType: "grupo_banda", description: "Festival de Pagode em Curitiba 2026 abre inscrições para grupos. Cachê + hospedagem.", city: "Curitiba", state: "PR", budgetMin: "3000", budgetMax: "8000", deadline: new Date("2026-05-15"), status: "active", isActive: true, tags: ["festival", "pagode", "curitiba"] },
    { userId: uid(13), title: "Oficina de Samba — Centro Cultural RS", category: "aula", requiredType: "professor", description: "Centro Cultural de Porto Alegre contrata ministrante para oficina de samba. 8 encontros.", city: "Porto Alegre", state: "RS", budgetMin: "3500", status: "active", isActive: true, tags: ["oficina", "samba", "centro cultural"] },
    { userId: uid(14), title: "Artista Residente — Casa de Samba Natal 2026", category: "evento", requiredType: "artista_solo", description: "Casa de samba em Salvador busca artista residente para o período de natal 2026. Pacote completo.", city: "Salvador", state: "BA", budgetMin: "8000", budgetMax: "15000", status: "active", isActive: true, tags: ["residente", "natal", "samba"] },
    { userId: uid(2),  title: "Parceria Roda de Samba — Bar Tradicional Lapa", category: "outro", requiredType: "grupo_banda", description: "Bar tradicional da Lapa carioca busca parceiros para roda de samba semanal. Dividir receita de bar.", city: "Rio de Janeiro", state: "RJ", status: "active", isActive: true, tags: ["roda de samba", "bar", "parceria"] },
    { userId: uid(3),  title: "Busco Estúdio de Gravação para Álbum Autoral", category: "estudio", requiredType: "estudio", description: "Artista de samba busca estúdio para gravar álbum de 10 faixas. Previsão: setembro 2026.", city: "Rio de Janeiro", state: "RJ", budgetMin: "8000", budgetMax: "15000", status: "active", isActive: true, tags: ["gravação", "álbum", "estúdio"] },
    { userId: uid(4),  title: "Luthier para Reforma Urgente de Cavaquinho", category: "servico", requiredType: "luthier", description: "Preciso de luthier urgente para reforma de cavaquinho com troca de trastes e ajuste de ação. SP.", city: "São Paulo", state: "SP", budgetMin: "200", budgetMax: "500", status: "active", isActive: true, tags: ["luthier", "cavaquinho", "reforma"] },
    { userId: uid(5),  title: "Documentário Musical — Artistas de Samba", category: "projeto", requiredType: "qualquer", description: "Produtora independente realiza documentário sobre samba brasileiro. Busca artistas para participar.", status: "active", isActive: true, tags: ["documentário", "samba", "cinema"] },
  ]);
  const allOpportunities = await db.select({ id: opportunities.id }).from(opportunities);
  console.log(`    ✓ ${allOpportunities.length} oportunidades criadas\n`);

  // ── academy (15) ────────────────────────────────────────────────────────────
  console.log("📚  Inserindo conteúdo Academia (15)...");
  await db.insert(academyContent).values([
    { authorId: uid(1), title: "História do Samba: Das Raízes ao Pagode", slug: slug("Historia do Samba Das Raizes ao Pagode"), excerpt: "Do terreiro baiano à Lapa carioca, uma jornada pela história do samba brasileiro.", content: "O samba brasileiro tem raízes profundas na cultura afro-brasileira...", contentType: "artigo", category: "historia", level: "iniciante", isPublished: true, publishedAt: daysAgo(60), thumbnailUrl: null, isPremium: false, tags: ["história", "samba", "origem"] },
    { authorId: uid(1), title: "Ritmos do Pagode: Do Partido Alto ao Pagode Romântico", slug: slug("Ritmos do Pagode Do Partido Alto ao Pagode Romantico"), excerpt: "Conheça as diferenças rítmicas e históricas entre os subgêneros do pagode.", content: "O pagode evoluiu do partido alto na década de 1970...", contentType: "artigo", category: "historia", level: "intermediario", isPublished: true, publishedAt: daysAgo(50), isPremium: false, tags: ["pagode", "ritmo", "história"] },
    { authorId: uid(1), title: "Samba de Roda: Patrimônio da Humanidade", slug: slug("Samba de Roda Patrimonio da Humanidade"), excerpt: "A UNESCO reconheceu o samba de roda como Patrimônio Cultural Imaterial da Humanidade. Saiba por quê.", content: "Em 2005, a UNESCO inscreveu o samba de roda do Recôncavo Baiano...", contentType: "artigo", category: "historia", level: "iniciante", isPublished: true, publishedAt: daysAgo(45), isPremium: false, tags: ["samba de roda", "bahia", "UNESCO"] },
    { authorId: uid(1), title: "Tutorial: Primeiros Acordes de Cavaquinho para Samba", slug: slug("Tutorial Primeiros Acordes de Cavaquinho para Samba"), excerpt: "Aprenda os 5 acordes essenciais que todo cavaquinista de samba precisa dominar.", content: "O cavaquinho é a alma harmônica do samba. Para tocar samba...", contentType: "tutorial", category: "tecnica", level: "iniciante", isPublished: true, publishedAt: daysAgo(40), isPremium: false, tags: ["cavaquinho", "acordes", "tutorial", "iniciante"] },
    { authorId: uid(1), title: "Como Tocar Pandeiro: Técnicas Fundamentais", slug: slug("Como Tocar Pandeiro Tecnicas Fundamentais"), excerpt: "Do toque básico ao treme-treme: técnicas essenciais de pandeiro para samba.", content: "O pandeiro é o instrumento mais versátil do samba...", contentType: "video", category: "tecnica", level: "iniciante", videoUrl: "https://www.youtube.com/watch?v=exemplo", isPublished: true, publishedAt: daysAgo(35), isPremium: false, tags: ["pandeiro", "técnica", "tutorial"] },
    { authorId: uid(1), title: "Composição no Samba: Estrutura e Forma", slug: slug("Composicao no Samba Estrutura e Forma"), excerpt: "Entenda a forma ABAB, o refrão e como construir um samba do zero.", content: "Compor um samba é uma arte que se aprende com a escuta e a prática...", contentType: "artigo", category: "composicao", level: "intermediario", isPublished: true, publishedAt: daysAgo(30), isPremium: false, tags: ["composição", "samba", "teoria"] },
    { authorId: uid(1), title: "Curso Completo de Pandeiro — Do Zero ao Profissional", slug: slug("Curso Completo de Pandeiro Do Zero ao Profissional"), excerpt: "12 módulos cobrindo desde o posicionamento das mãos até técnicas avançadas de solo.", content: "Este curso completo de pandeiro foi desenvolvido por mestres...", contentType: "curso", category: "tecnica", level: "iniciante", isPremium: true, price: "89", isPublished: true, publishedAt: daysAgo(25), duration: 480, tags: ["pandeiro", "curso", "completo", "premium"] },
    { authorId: uid(1), title: "O Mercado Musical do Samba: Como Viver da Música", slug: slug("O Mercado Musical do Samba Como Viver da Musica"), excerpt: "Estratégias práticas para músicos de samba construírem carreira e renda sustentável.", content: "Viver de samba é possível. Mas exige estratégia e profissionalismo...", contentType: "artigo", category: "carreira", level: "intermediario", isPublished: true, publishedAt: daysAgo(20), isPremium: false, tags: ["carreira", "mercado musical", "samba"] },
    { authorId: uid(1), title: "Distribuição Digital para Artistas de Samba", slug: slug("Distribuicao Digital para Artistas de Samba"), excerpt: "Guia completo: como colocar sua música em todos os streamings de forma independente.", content: "A distribuição digital democratizou o acesso ao mercado musical...", contentType: "tutorial", category: "negocios", level: "iniciante", isPublished: true, publishedAt: daysAgo(18), isPremium: false, tags: ["distribuição", "spotify", "digital", "independente"] },
    { authorId: uid(1), title: "Instrumentos de Percussão do Samba: Guia Completo", slug: slug("Instrumentos de Percussao do Samba Guia Completo"), excerpt: "Do pandeiro ao repique: conheça todos os instrumentos da bateria de samba.", content: "A percussão é o coração do samba. Cada instrumento tem seu papel...", contentType: "artigo", category: "instrumentos", level: "iniciante", isPublished: true, publishedAt: daysAgo(15), isPremium: false, tags: ["percussão", "instrumentos", "samba"] },
    { authorId: uid(1), title: "Podcast: Sambistas que Marcaram o Século XX", slug: slug("Podcast Sambistas que Marcaram o Seculo XX"), excerpt: "Conversas com pesquisadores sobre os grandes nomes do samba brasileiro do século passado.", content: "Neste episódio, falamos sobre Cartola, Nelson Cavaquinho, Paulinho da Viola...", contentType: "podcast", category: "historia", level: "iniciante", isPublished: true, publishedAt: daysAgo(12), isPremium: false, duration: 75, tags: ["podcast", "história", "sambistas", "clássicos"] },
    { authorId: uid(1), title: "Harmonia Aplicada ao Samba: Extensões e Substituições", slug: slug("Harmonia Aplicada ao Samba Extensoes e Substituicoes"), excerpt: "Para músicos intermediários: como usar acordes de extensão para enriquecer o samba.", content: "A harmonia do samba tem particularidades que a diferem de outros gêneros...", contentType: "tutorial", category: "tecnica", level: "avancado", isPremium: true, price: "39", isPublished: true, publishedAt: daysAgo(10), tags: ["harmonia", "samba", "avançado", "acordes"] },
    { authorId: uid(1), title: "Gestão de Carreira para Grupos de Pagode", slug: slug("Gestao de Carreira para Grupos de Pagode"), excerpt: "Como organizar o grupo, dividir funções, negociar contratos e crescer juntos.", content: "Gerir um grupo musical é um desafio tão grande quanto tocar bem...", contentType: "artigo", category: "negocios", level: "intermediario", isPublished: true, publishedAt: daysAgo(8), isPremium: false, tags: ["gestão", "grupo", "pagode", "carreira"] },
    { authorId: uid(1), title: "Produção Musical de Samba em Home Studio", slug: slug("Producao Musical de Samba em Home Studio"), excerpt: "Monte seu home studio, escolha os equipamentos certos e produza samba de qualidade.", content: "Com equipamentos acessíveis, é possível produzir samba de alta qualidade em casa...", contentType: "tutorial", category: "producao", level: "intermediario", isPremium: true, price: "59", isPublished: true, publishedAt: daysAgo(5), tags: ["produção", "home studio", "samba"] },
    { authorId: uid(1), title: "Cultura e Resistência: O Samba como Movimento Social", slug: slug("Cultura e Resistencia O Samba como Movimento Social"), excerpt: "O samba como forma de resistência cultural e afirmação da identidade afro-brasileira.", content: "O samba nasceu como expressão de resistência...", contentType: "artigo", category: "cultura", level: "iniciante", isPublished: true, publishedAt: daysAgo(3), isPremium: false, tags: ["cultura", "resistência", "identidade", "afro-brasileira"] },
  ]);
  const allAcademy = await db.select({ id: academyContent.id }).from(academyContent);
  console.log(`    ✓ ${allAcademy.length} conteúdos da academia criados\n`);

  // ── financial records (12 meses + custos) ────────────────────────────────────
  console.log("💰  Inserindo registros financeiros...");
  const months = [
    ["2025-04", 12400, 3200], ["2025-05", 15600, 3800], ["2025-06", 14200, 4100],
    ["2025-07", 18900, 4500], ["2025-08", 22300, 5200], ["2025-09", 19800, 4800],
    ["2025-10", 25100, 5600], ["2025-11", 28400, 6200], ["2025-12", 35200, 7800],
    ["2026-01", 21500, 5100], ["2026-02", 24700, 5900], ["2026-03", 29300, 6500],
  ];
  for (const [period, receita, custo] of months) {
    const [year, month] = (period as string).split("-");
    const recordedAt = new Date(`${year}-${month}-01`);
    await db.insert(financialRecords).values([
      { type: "receita", category: "assinatura", amount: String(Math.round((receita as number) * 0.55)), description: `Assinaturas premium — ${period}`, recordedAt },
      { type: "receita", category: "reserva_estudio", amount: String(Math.round((receita as number) * 0.25)), description: `Reservas de estúdio — ${period}`, recordedAt },
      { type: "receita", category: "academia", amount: String(Math.round((receita as number) * 0.20)), description: `Conteúdo Academia — ${period}`, recordedAt },
      { type: "custo", category: "infraestrutura", amount: String(Math.round((custo as number) * 0.45)), description: `Infra e hospedagem — ${period}`, recordedAt },
      { type: "custo", category: "pessoal", amount: String(Math.round((custo as number) * 0.40)), description: `Equipe — ${period}`, recordedAt },
      { type: "custo", category: "marketing", amount: String(Math.round((custo as number) * 0.15)), description: `Marketing — ${period}`, recordedAt },
    ]);
  }
  const allFinancial = await db.select({ id: financialRecords.id }).from(financialRecords);
  console.log(`    ✓ ${allFinancial.length} registros financeiros criados\n`);

  // ── notifications ────────────────────────────────────────────────────────────
  console.log("🔔  Inserindo notificações...");
  const notifUserId = uid(2);
  await db.insert(notifications).values([
    { userId: notifUserId, type: "sistema", title: "Bem-vindo à PNSP!", message: "Sua conta foi criada com sucesso. Explore os perfis, ofertas e oportunidades da plataforma.", isRead: false, createdAt: daysAgo(1) },
    { userId: notifUserId, type: "oferta", title: "Nova oferta na sua área", message: "Um novo show de samba está disponível no Rio de Janeiro.", link: "/ofertas", isRead: false, createdAt: daysAgo(1) },
    { userId: notifUserId, type: "oportunidade", title: "Oportunidade compatível com seu perfil", message: "Uma nova vaga para percussionista em samba foi publicada.", link: "/oportunidades", isRead: true, createdAt: daysAgo(2) },
    { userId: notifUserId, type: "academia", title: "Novo conteúdo na Academia", message: "Publicamos um novo tutorial: Primeiros Acordes de Cavaquinho.", link: "/academia", isRead: true, createdAt: daysAgo(3) },
    { userId: uid(3), type: "sistema", title: "Bem-vindo à PNSP!", message: "Sua conta foi criada com sucesso. Complete seu perfil para aparecer nas buscas.", isRead: false, createdAt: daysAgo(2) },
    { userId: uid(4), type: "sistema", title: "Seu perfil está em análise", message: "Seu perfil foi submetido e está em análise. Em breve será publicado.", isRead: false, createdAt: daysAgo(5) },
    { userId: uid(5), type: "oportunidade", title: "Sua candidatura foi recebida", message: "A produtora recebeu sua candidatura para o projeto Samba nas Escolas.", isRead: false, createdAt: daysAgo(1) },
  ]);
  const allNotifs = await db.select({ id: notifications.id }).from(notifications);
  console.log(`    ✓ ${allNotifs.length} notificações criadas\n`);

  // ── platform metrics ─────────────────────────────────────────────────────────
  console.log("📊  Inserindo métricas da plataforma...");
  const metricMonths = [
    { date: "2025-10-01", totalUsers: 312, newUsers: 45, totalProfiles: 198, totalOfferings: 143, totalOpportunities: 87, totalApplications: 234, totalBookings: 67, totalRevenue: "25100" },
    { date: "2025-11-01", totalUsers: 387, newUsers: 75, totalProfiles: 241, totalOfferings: 172, totalOpportunities: 109, totalApplications: 298, totalBookings: 89, totalRevenue: "28400" },
    { date: "2025-12-01", totalUsers: 489, newUsers: 102, totalProfiles: 312, totalOfferings: 218, totalOpportunities: 138, totalApplications: 387, totalBookings: 124, totalRevenue: "35200" },
    { date: "2026-01-01", totalUsers: 534, newUsers: 45, totalProfiles: 351, totalOfferings: 245, totalOpportunities: 152, totalApplications: 412, totalBookings: 98, totalRevenue: "21500" },
    { date: "2026-02-01", totalUsers: 601, newUsers: 67, totalProfiles: 398, totalOfferings: 279, totalOpportunities: 171, totalApplications: 478, totalBookings: 112, totalRevenue: "24700" },
    { date: "2026-03-01", totalUsers: 687, newUsers: 86, totalProfiles: 451, totalOfferings: 318, totalOpportunities: 192, totalApplications: 543, totalBookings: 134, totalRevenue: "29300", activeUsers: 312 },
  ];
  await db.insert(platformMetrics).values(metricMonths.map((m) => ({ ...m, activeUsers: m.activeUsers ?? Math.round(m.totalUsers * 0.45) })));
  console.log(`    ✓ ${metricMonths.length} registros de métricas criados\n`);

  // ─── summary ──────────────────────────────────────────────────────────────────
  console.log("─".repeat(50));
  console.log("✅  Seed PNSP concluído!\n");
  console.log(`   👤 Usuários       : ${allUsers.length}`);
  console.log(`   🎭 Perfis         : ${allProfiles.length}`);
  console.log(`   🎙  Estúdios       : ${allStudios.length}`);
  console.log(`   🎵 Ofertas        : ${allOfferings.length}`);
  console.log(`   🎯 Oportunidades  : ${allOpportunities.length}`);
  console.log(`   📚 Academia       : ${allAcademy.length}`);
  console.log(`   💰 Fin. Records   : ${allFinancial.length}`);
  console.log(`   🔔 Notificações   : ${allNotifs.length}`);
  console.log(`   📊 Métricas       : ${metricMonths.length}`);
  console.log("─".repeat(50));
}

main()
  .catch((err) => {
    console.error("❌ Seed falhou:", err);
    process.exit(1);
  })
  .finally(() => client.end());
