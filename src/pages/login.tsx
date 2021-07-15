import Head from 'next/head'
import Link from 'next/link'
import React, { FC, useState } from 'react'
import api from '../helpers/api'
import { logIn, logOut } from '../helpers/auth'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

type LoginData = {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().email().max(255).required(),
  password: yup.string().min(12).required()
});

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: LoginData) => {
    setLoading(true)
    api.get('csrf-cookie').then(() => {
      api.post('login', data).then(res => logIn()).catch(e => logOut())
    })
  }

  const LoginCardFooter: FC = () => {
    return (
      <div className="p-field p-d-flex p-jc-center">
        <Link href="/register">Don&apos;t have an account?</Link>
      </div>
    )
  }

  const getFormErrorMessage = (name: string) => {
    return errors[name] && <div className="invalid-tooltip">{errors[name].message}</div>
  };

  return (
    <div>
      <Head>
        <title>Login</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container d-flex flex-column justify-content-center align-content-center vh-100 w-sm-100 w-50">
        <form onSubmit={handleSubmit(onSubmit)} className="card border-dark mb-3">
          <div className="card-header">Login</div>
          <div className="card-body text-dark">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input type="email" className="form-control" id="email" {...register("email")}  />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" className="form-control" id="password" {...register("password")}/>
            </div>
            <div className="mb-3 d-flex justify-content-center">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <div className="mb-3 d-flex justify-content-center">
              <button className="btn btn-secondary" type="submit">Log in</button>
            </div>

            <div className="mb-3 d-flex justify-content-center">
              <Link href="/register">Don&apos;t have an account?</Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}