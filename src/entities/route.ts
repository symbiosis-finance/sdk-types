import invariant from 'tiny-invariant'

import type { ChainId } from '../constants'
import { Price } from './fractions'
import type { Pair } from './pair'
import type { Token } from './token'
import type { Chain } from './chain'

/**
 * A path through Uniswap V2 pairs on one chain, from `input` to `output`. Either end can be the gas token. The path
 * holds its wrapped form, as the pairs do (Token.wrapped).
 */
export class Route {
    public readonly pairs: Pair[]
    /** The tokens the route passes through, the gas token wrapped. */
    public readonly path: Token[]
    public readonly input: Token
    public readonly output: Token
    /** How much `output` one `input` buys at the pairs' reserves, before any trade moves them. */
    public readonly midPrice: Price
    public readonly chain: Chain

    /** Errors when the pairs are empty, are not all on `chain`, or do not lead from `input` to `output`. */
    public constructor(chain: Chain, pairs: Pair[], input: Token, output: Token)
    /**
     * @deprecated Pass the pairs' chain first (`new Route(chain, pairs, input, output)`). Without it, the route takes
     * the chain of the pairs' tokens (Token.chain), and the constructor errors when that chain is undefined.
     */
    public constructor(pairs: Pair[], input: Token, output: Token)
    public constructor(...args: [Chain, Pair[], Token, Token] | [Pair[], Token, Token]) {
        const [chain, pairs, input, output] = Array.isArray(args[0])
            ? [undefined, ...(args as [Pair[], Token, Token])]
            : (args as [Chain, Pair[], Token, Token])
        invariant(pairs.length > 0, 'PAIRS')
        const routeChain = chain ?? pairs[0].requiredChain
        invariant(
            pairs.every((pair) => pair.chainId === routeChain.id),
            'CHAIN_IDS'
        )
        this.chain = routeChain
        const first = pairs[0]
        const last = pairs[pairs.length - 1]
        invariant(first.involvesToken(input.wrapped), 'INPUT')
        invariant(last.involvesToken(output.wrapped), 'OUTPUT')

        const path: Token[] = [input.wrapped]
        for (const [i, pair] of pairs.entries()) {
            const currentInput = path[i]
            invariant(pair.involvesToken(currentInput), 'PATH')
            path.push(pair.otherToken(currentInput))
        }

        this.pairs = pairs
        this.path = path
        this.midPrice = Price.fromRoute(this)
        this.input = input
        this.output = output
    }

    public get chainId(): ChainId {
        return this.pairs[0].chainId
    }
}
