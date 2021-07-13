import Link from "next/link";
import api from "../helpers/api";
import { logOut, useIsLoggedIn } from "../helpers/auth";


export default function Header(props: any) {
  const isLoggedIn: boolean = useIsLoggedIn();

  const handleLogOut = () => {
    api.post('logout').then(res => logOut())
  }

  return (
    <header>
      <Link href="/cart">Cart</Link>
      {isLoggedIn ?
        <button className='btn btn-light' onClick={handleLogOut}>Log out</button>
        :
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      }
    </header>

  );
}
