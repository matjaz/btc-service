# BTC service

Modular BTC service supporting various LUDS, NIPS and custom modules.\
Create multi user Lightning ([LUD-16](https://github.com/lnurl/luds/blob/luds/16.md)) and Nostr addresses ([NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md)) supporting multiple domains.\
Extensible via modules.

## Main features

- multi users
- multi domains
- configurable modules
- custom modules
- HTTP server

## Support

### Backends

- [Nostr Wallet Connect (NWC)](https://nwc.dev/)
- LUD-16 proxy forward - enables sats forwarding

### Supported modules

- ✅ LUD-03 - `withdrawRequest`
- ✅ LUD-06 - `payRequest`
- ✅ LUD-09 - `successAction`
- ✅ LUD-11 - `disposable`
- ✅ LUD-12 - `comments`
- ✅ LUD-14 - `balanceCheck`
- ✅ LUD-15 - `balanceNotify`
- ✅ LUD-16 - `internet identifier`
- ✅ LUD-18 - `payerData`
- ✅ LUD-20 - `long description`
- ✅ LUD-21 - `verify`
- ✅ NIP-05 - `Nostr internet identifier`

- ✅ Public user profile page, with send sats form

### In progress

- NIP-57 - `Nostr zaps`

### Feature requests

- ✅ TypeScript
- ✅ Pluggable storage ([Prisma](https://www.prisma.io/))
- Admin GUI
- REST API
- More backends (LDK, phoenixd, ...)
- CLI tool

## Installation

    git clone https://github.com/matjaz/btc-service.git
    npm i
    # edit examples/server.js and enable desired modules
    # copy and modify .env.example
    npm start

## Usage examples

You can find examples in the [examples](examples/) directory.

## Development

Before adding new modules open issue to discuss which proposal or improvement you want to add.

## License

MIT
