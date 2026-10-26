import { testServerAndClientResource } from '@trpc/client/__tests__/testClientResource';
import { initTRPC } from '@trpc/server';
import myzod from 'myzod';
import * as t from 'superstruct';
import * as S from 'sury';
import * as v from 'valibot';
import * as yup from 'yup';
import { z } from 'zod';

test('zod', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(z.string().or(z.number()))
      .output(
        z.object({
          input: z.string(),
        }),
      )
      // @ts-expect-error mismatch between input and output
      .query((opts) => {
        return { input: opts.input };
      }),
  });
  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('zod async', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(z.string().or(z.number()))
      .output(
        z
          .object({
            input: z.string(),
          })
          .refine(async (value) => !!value),
      )
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('zod transform', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(z.string().or(z.number()))
      .output(
        z.object({
          input: z.string().transform((s) => s.length),
        }),
      )
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeNumber();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": 6,
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('valibot', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(v.union([v.string(), v.number()]))
      .output(v.object({ input: v.string() }))
      .query(({ input }) => {
        return { input: input as string };
      }),
  });
  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('valibot async', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(v.parserAsync(v.unionAsync([v.string(), v.number()])))
      .output(
        v.parserAsync(
          v.pipeAsync(
            v.objectAsync({ input: v.string() }),
            v.checkAsync(async (value) => !!value),
          ),
        ),
      )
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('valibot transform', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(v.union([v.string(), v.number()]))
      .output(
        v.object({
          input: v.pipe(
            v.string(),
            v.transform((s) => s.length),
          ),
        }),
      )
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeNumber();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": 6,
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('superstruct', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(t.union([t.string(), t.number()]))
      .output(
        t.object({
          input: t.string(),
        }),
      )
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('yup', async () => {
  const yupStringOrNumber = (value: unknown) => {
    switch (typeof value) {
      case 'number':
        return yup.number().required();
      case 'string':
        return yup.string().required();
      case 'bigint': {
        throw new Error('Not implemented yet: "bigint" case');
      }
      case 'boolean': {
        throw new Error('Not implemented yet: "boolean" case');
      }
      case 'symbol': {
        throw new Error('Not implemented yet: "symbol" case');
      }
      case 'undefined': {
        throw new Error('Not implemented yet: "undefined" case');
      }
      case 'object': {
        throw new Error('Not implemented yet: "object" case');
      }
      case 'function': {
        throw new Error('Not implemented yet: "function" case');
      }
      default:
        throw new Error('Fail');
    }
  };

  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(yup.lazy(yupStringOrNumber))
      .output(
        yup.object({
          input: yup.string().strict().required(),
        }),
      )
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('myzod', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(myzod.string().or(myzod.number()))
      .output(
        myzod.object({
          input: myzod.string(),
        }),
      )
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('sury', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(S.union([S.string, S.number]))
      .output(S.schema({ input: S.string }))
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('sury async', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(S.union([S.string, S.number]))
      .output(
        S.schema({
          input: S.string.with(S.to, S.string, {
            decode: { async: async (value) => value },
            encode: 'auto',
          }),
        }),
      )
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('sury transform', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input(S.union([S.string, S.number]))
      .output(S.schema({ input: S.string.with(S.to, S.number) }))
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('1234');
  expectTypeOf(output.input).toBeNumber();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": 1234,
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('validator fn', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input((value: unknown) => value as number | string)
      .output((value: unknown) => {
        if (typeof (value as any).input === 'string') {
          return value as { input: string };
        }
        throw new Error('Fail');
      })
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test('async validator fn', async () => {
  const trpc = initTRPC.create();
  const router = trpc.router({
    q: trpc.procedure
      .input((value: unknown) => value as number | string)
      .output(async (value: any): Promise<{ input: string }> => {
        if (value && typeof value.input === 'string') {
          return { input: value.input };
        }
        throw new Error('Fail');
      })
      .query(({ input }) => {
        return { input: input as string };
      }),
  });

  await using ctx = testServerAndClientResource(router);

  const output = await ctx.client.q.query('foobar');
  expectTypeOf(output.input).toBeString();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "input": "foobar",
    }
  `);

  await expect(ctx.client.q.query(1234)).rejects.toMatchInlineSnapshot(
    `[TRPCClientError: Output validation failed]`,
  );
});

test.each(['encode', 'encodeAsync'] as const)(
  'typed output function: Zod codec %s',
  async (method) => {
    const trpc = initTRPC.create();
    const schema = z.object({
      value: z.codec(z.string(), z.bigint().nonnegative(), {
        decode: (value) => BigInt(value),
        encode: (value) => value.toString(),
      }),
    });
    // Zod's encode methods close over the schema and do not use `this`.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const procedure = trpc.procedure.output(schema[method]);
    const router = trpc.router({
      q: procedure.input(z.boolean()).query((opts) => ({
        value: opts.input ? 123n : -1n,
      })),
    });

    // @ts-expect-error the resolver must return the encoder's input, not its output
    procedure.query(() => ({ value: '123' }));

    await using ctx = testServerAndClientResource(router);
    const output = await ctx.client.q.query(true);
    expectTypeOf(output).toEqualTypeOf<{ value: string }>();
    expect(output).toEqual({ value: '123' });

    await expect(ctx.client.q.query(false)).rejects.toThrow(
      'Output validation failed',
    );
  },
);

test('custom validator functions preserve unknown input inference', async () => {
  const trpc = initTRPC.create();
  const procedure = trpc.procedure
    .input((value) => {
      expectTypeOf(value).toBeUnknown();
      if (typeof value !== 'string') {
        throw new Error('Expected a string');
      }
      return value;
    })
    .output((value) => {
      expectTypeOf(value).toBeUnknown();
      if (typeof value !== 'string') {
        throw new Error('Expected a string');
      }
      return value;
    });

  // @ts-expect-error unknown-input validators still require their inferred output
  procedure.query(() => 123);

  const router = trpc.router({
    q: procedure.query((opts) => {
      expectTypeOf(opts.input).toBeString();
      return opts.input;
    }),
  });
  await using ctx = testServerAndClientResource(router);
  expectTypeOf(ctx.client.q.query).parameter(0).toBeString();
  expect(await ctx.client.q.query('hello')).toBe('hello');
});
