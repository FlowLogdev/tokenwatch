export function cleanEnv(value: string | undefined, fallback = '') {
  return (value ?? fallback).replace(/^\uFEFF/, '').trim()
}
