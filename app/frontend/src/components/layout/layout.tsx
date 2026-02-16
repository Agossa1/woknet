import { Header } from "./headers";
import { AppSidebar } from "./sidebar";

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* On passe les données ici. 
         Plus tard, tu pourras connecter Redux ICI (dans le parent) 
         pour passer les données aux enfants via les props.
      */}
      <Header 
        user={{ name: "John Doe", email: "john@example.com" }} 
        onSearch={(v) => console.log(v)}
        onLogout={() => console.log("Logout")}
      />
      
      <div className="flex pt-16 max-w-[1440px] mx-auto">
        <AppSidebar />
        
        {/* Main Content: Décalé à cause de la sidebar fixed */}
        <main className="flex-1 lg:ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}