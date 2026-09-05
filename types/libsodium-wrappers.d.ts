declare module "libsodium-wrappers" {
  interface Sodium {
    ready: Promise<void>
    crypto_sign_verify_detached(
      signature: Uint8Array,
      message: Uint8Array,
      publicKey: Uint8Array
    ): boolean
  }

  const sodium: Sodium
  export default sodium
}
