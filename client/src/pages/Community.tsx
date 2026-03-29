import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import CommunityFeed from "@/components/CommunityFeed";
import { Users } from "lucide-react";

export default function CommunityPage() {
  const { user } = useAuth();
  const profileQ = trpc.profiles.getMyProfile.useQuery(undefined, { enabled: !!user });
  const myProfile = profileQ.data;

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users size={24} style={{ color: "var(--ouro)" }} />
          <div>
            <h1 className="text-xl font-display font-bold" style={{ color: "var(--creme)" }}>Comunidade</h1>
            <p className="text-sm" style={{ color: "var(--creme-50)" }}>Conecte-se com a cena musical</p>
          </div>
        </div>
        <CommunityFeed myProfileId={myProfile?.id} showComposer={!!user && !!myProfile} />
      </div>
    </PublicLayout>
  );
}
