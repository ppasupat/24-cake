#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip, permutations
from collections import defaultdict, Counter

import numpy as np
from numpy.random import choice


CHECK = {
        '+': lambda x, y: y != 0,
        '-': lambda x, y: y != 0,
        'r-': lambda x, y: True,
        '*': lambda x, y: y != 1,
        '/': lambda x, y: y != 0 and y != 1,
        'r/': lambda x, y: x != 0,
        }
OPERATORS = {
        '+': lambda x, y: x + y,
        '-': lambda x, y: x - y,
        'r-': lambda x, y: y - x,
        '*': lambda x, y: x * y,
        '/': lambda x, y: x / y,
        'r/': lambda x, y: y / x,
        }


def bfs(old_states, gimmicks=None):
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
    for x, g in old_states:
        s = sum(deriv[1] for deriv in old_states[x])
        for op in ('+', '-', '*', '/'):
            for y in range(10):
                if not CHECK[op](x, y):
                    continue
                result = OPERATORS[op](x, y)
                new_states[result].append((x, s, op, y))
    return new_states


def get_sample(states):
    sample = []
    target = 24.0
    for state in reversed(states):
        derivs = state[target]
        p = np.array([deriv[1] * 1. for deriv in derivs])
        i = choice(len(p), p=(p / p.sum()))
        sample.append((target,) + derivs[i][2:])
        target = derivs[i][0]
    return sample[::-1]


def check_multisol(sample):
    init = sample[0][0]
    rest = tuple(x[1:] for x in sample[1:])
    for perm in set(permutations(rest)):
        if perm == rest:
            continue
        perm_sample = [sample[0]]
        x = init
        for op_args in perm:
            x = OPERATORS[op_args[0]](x, *op_args[1:])
            perm_sample.append((x,) + op_args)
        if x == 24.0:
            yield perm_sample

def pretty_print(sample):
    for step in sample:
        print ' '.join(str(x) for x in step[1:] + ('=', step[0])),
    print


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--num-steps', type=int, default=3,
            help='number of operations')
    parser.add_argument('-s', '--num-samples', type=int, default=100,
            help='number of samples')
    args = parser.parse_args()

    init_states = {float(x): [(float(x), 1, x)] for x in range(10)}
    states = [init_states]
    for i in xrange(args.num_steps):
        states.append(bfs(states[-1]))
        print >> sys.stderr, 'Step {}: Found {} states'.format(i, len(states[-1]))
    
    # Sample uniformly
    for s in xrange(args.num_samples):
        sample = get_sample(states)
        multisols = list(check_multisol(sample))
        if not multisols:
            pretty_print(sample)
        #pretty_print(sample)
        #for perm_sample in multisols:
        #    print '  >',
        #    pretty_print(perm_sample)


if __name__ == '__main__':
    main()

