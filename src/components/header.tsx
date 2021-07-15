import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../helpers/api";
import { logOut, useIsLoggedIn } from "../helpers/auth";

export default function Header(props: any) {
  const [mounted, setMounted] = useState(false);
  const isLoggedIn: boolean = useIsLoggedIn();
  const categories = props.categories

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogOut = () => {
    api.post('logout').then(res => logOut()).catch(e => console.log(e))
  }

  const AuthSection = () => {
    if (isLoggedIn) {
      return (
        <li className="nav-item">
          <a className="nav-link" role="button" onClick={handleLogOut}>Log out</a>
        </li>
      )
    }
    return (
      <>
        <li className="nav-item">
          <Link href="/login"><a className="nav-link">Log in</a></Link>
        </li>
        <li className="nav-item">
          <Link href="/register"><a className="nav-link">Register</a></Link>
        </li>
      </>
    )
  }

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
        <Link href="/"><a className="navbar-brand">Larbonne</a></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link href="/"><a className="nav-link active" aria-current="page">Home</a></Link>
              </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Men</a>
                </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Women</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Children</a>
              </li>
            </ul>
            <ul className="navbar-nav mb-2 mb-lg-0 d-flex">
              <li className="nav-item">
                <Link href="/cart"><a className="nav-link">Cart</a></Link>
              </li>
              { mounted && <AuthSection /> }
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
