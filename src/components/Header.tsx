import { Button } from "@/components/ui/button";

interface HeaderProps {
  onLogout?: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  return (
    <header className="bg-background border-b-2 border-foreground" role="banner">
      <div className="flex justify-between items-center px-4 py-2">
        <h1 className="text-foreground font-bebas font-bold text-3xl md:text-4xl lg:text-5xl">
          Desenvolvimento e Inovação
        </h1>
        <div className="flex items-center gap-3">
          {onLogout && (
            <Button variant="outline" onClick={onLogout}>
              Sair
            </Button>
          )}
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
            <img
              src="/editado.png"
              alt="Logotipo da Fundação Dorina Nowill, composto por um smiley face de óculos escuros"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
