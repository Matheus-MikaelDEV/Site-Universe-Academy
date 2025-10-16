import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProfileForm } from "@/components/ProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileData } from "@/hooks/use-profile-data";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfileData();

  if (authLoading || profileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-12 flex items-center justify-center">
          <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e foto de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && profile && <ProfileForm user={user} profile={profile} />}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;