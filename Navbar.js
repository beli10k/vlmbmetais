"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const links = !user
    ? [["/", "Início"], ["/#como-funciona", "Como funciona"], ["/sobre", "Sobre nós"], ["/login", "Entrar"], ["/cadastro", "Cadastrar"]]
    : [
        ["/", "Início"],
        ["/registrar-venda", "Registrar Venda"],
        ["/historico", "Meu Histórico"],
        ...(isAdmin ? [["/admin", "Painel Administrativo"]] : []),
        ["/sobre", "Sobre nós"],
      ];

  const sair = async () => {
    await signOut();
    setAberto(false);
    router.replace("/login");
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link href="/" className="brand" onClick={() => setAberto(false)}>
          VLMB <span>Metais</span>
        </Link>
        <button className="menu-toggle" aria-label="Abrir menu" onClick={() => setAberto(!aberto)}>
          <span /><span /><span />
        </button>
        <nav className={`nav-links ${aberto ? "open" : ""}`}>
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setAberto(false)} className={pathname === href ? "active" : ""}>
              {label}
            </Link>
          ))}
          {user && <button className="btn btn-outline btn-sm" onClick={sair}>Sair</button>}
        </nav>
      </div>
    </header>
  );
}
