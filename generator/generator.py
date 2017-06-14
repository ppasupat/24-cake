#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip, permutations
from collections import defaultdict, Counter

import numpy as np
from numpy.random import choice

from operations import *


BASIC_OPS = [
        Add(range(1, 10)),
        Sub(range(1, 10)),
        Mul([0] + range(2, 10)),
        Div(range(2, 10)),
        ]
GIMMICKS = {
        'r-': RSub(range(10)),
        'r/': RDiv(range(10)),
        '^2': Square(),
        '^3': Cube(),
        '2^': TwoPower(),
        'sqrt': Sqrt(),
        'cbrt': Cbrt(),
        'flip': Flip(),
        'fact': Factorial(),
        'sin': Sin(),
        'cos': Cos(),
        'tan': Tan(),
        'abs': Abs(),
        }


def displayable(x):
    if isinstance(x, str):
        return len(x) <= 4
    if abs(x - int(x)) < 1e-6:
        x = int(x)
        return -999 <= x <= 9999
    return -10 < x < 100


def bfs(old_states, gimmicks):
    """
    Args:
        old_states: previous new_states
        gimmicks: list of gimmick steps
    Returns:
        new_states: dict from computation results to list of possible derivations
            Each computation result is (result, gimmick_flag)
                gimmick_flag is a tuple of booleans
            Each derivation is (previous_computation_result,
                num_prev_derivs, *operation_and_args)
    """
    new_states = defaultdict(list)
    for state in old_states:
        x, g = state
        s = sum(deriv[1] for deriv in old_states[state])
        for op in BASIC_OPS:
            for args in op.generate():
                try:
                    result = op(x, *args)
                    assert isinstance(result, float) and displayable(result)
                    new_states[result, g].append((state, s, op) + args)
                except AssertionError:
                    pass
        for i, op in enumerate(gimmicks):
            if g[i]:
                continue
            for args in op.generate():
                try:
                    result = op(x, *args)
                    if isinstance(result, int):
                        result = float(result)
                    assert isinstance(result, float) and displayable(result)
                    new_g = g[:i] + (True,) + g[i+1:]
                    new_states[result, new_g].append((state, s, op) + args)
                except AssertionError:
                    pass
    return new_states


def get_sample(states, target):
    sample = []
    for state in reversed(states):
        derivs = state[target]
        p = np.array([deriv[1] * 1. for deriv in derivs])
        i = choice(len(p), p=(p / p.sum()))
        sample.append((target[0],) + derivs[i][2:])
        target = derivs[i][0]
    return sample[::-1]

def check_same(sample):
    y = None
    used_ops = set()
    for item in sample[1:]:
        if len(item) <= 2:
            return False
        if y is None:
            y = item[2]
        elif y != item[2] or item[1].name in used_ops:
            return False
        used_ops.add(item[1].name)
    return True

def check_later_mul0(sample):
    if sample[1][1].name == '*' and sample[1][2] == 0:
        return False
    for item in sample[2:]:
        if item[1].name == '*' and item[2] == 0:
            return True
    return False

def check_multisol(sample):
    init = sample[0][0]
    rest = tuple(x[1:] for x in sample[1:])
    for perm in set(permutations(rest)):
        if perm == rest:
            continue
        perm_sample = [sample[0]]
        x = init
        for i, op_args in enumerate(perm):
            op, args = op_args[0], op_args[1:]
            x = op(x, *args)
            perm_sample.append((x,) + op_args)
            if isinstance(x, int):
                x = float(x)
            if i != len(perm) - 1:
                assert isinstance(x, float)
            assert displayable(x)
        if x == 24.0:
            yield perm_sample

def pretty_print(sample, prefix):
    print prefix, sample[0][0],
    for step in sample[1:]:
        print step[1].name,
        if step[2:]:
            print ' '.join(str(x) for x in step[2:]),
        print '=', step[0],
    print


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--num-steps', type=int, default=3,
            help='number of operations')
    parser.add_argument('-s', '--num-samples', type=int, default=100,
            help='number of samples')
    parser.add_argument('-i', '--init-nums', type=float, nargs='+')
    parser.add_argument('-g', '--gimmicks', nargs='+')
    parser.add_argument('-r', '--restrictions', nargs='+')
    args = parser.parse_args()

    gimmicks = [GIMMICKS[x] for x in (args.gimmicks or [])]
    checkers = []

    for r in (args.restrictions or []):
        if r == 'x0':
            BASIC_OPS[2] = Mul(xrange(2, 10))
        elif r == 'same':
            checkers.append(check_same)
        elif r.startswith('same='):
            y = float(r[5:])
            BASIC_OPS[0] = Add([y])
            BASIC_OPS[1] = Sub([y])
            BASIC_OPS[2] = Mul([y])
            BASIC_OPS[3] = Div([y])
            checkers.append(check_same)
        elif r == 'later_mul0':
            checkers.append(check_later_mul0)
        else:
            raise ValueError('Unknown restriction {}'.format(r))

    if not args.init_nums:
        args.init_nums = range(10)
    init_states = {(float(x), (False,) * len(gimmicks)): [(None, 1, x)]
            for x in args.init_nums}
    states = [init_states]

    for i in xrange(args.num_steps):
        states.append(bfs(states[-1], gimmicks))
        print >> sys.stderr, 'Step {}: Found {} states'.format(i, len(states[-1]))
    
    # Sample uniformly
    for s in xrange(args.num_samples):
        sample = get_sample(states, (24, (True,) * len(gimmicks)))
        if not all(checker(sample) for checker in checkers):
            pretty_print(sample, prefix='FAIL ')
            continue
        try:
            multisols = list(check_multisol(sample))
            if not multisols:
                pretty_print(sample, prefix='OK   ')
            else:
                pretty_print(sample, prefix='MULTI')
        except AssertionError:
            pretty_print(sample, prefix='ERROR')


if __name__ == '__main__':
    main()

