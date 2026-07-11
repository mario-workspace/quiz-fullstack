import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from './button';

describe('Button', () => {
  it('renders children', () => {
    const html = renderToStaticMarkup(<Button>Click me</Button>);
    expect(html).toContain('Click me');
    expect(html).toContain('<button');
  });

  it('applies variant and size classes', () => {
    const html = renderToStaticMarkup(
      <Button variant="outline" size="sm">
        Outline
      </Button>,
    );
    expect(html).toContain('Outline');
    expect(html).toContain('border');
  });

  it('supports disabled state', () => {
    const html = renderToStaticMarkup(<Button disabled>Disabled</Button>);
    expect(html).toContain('disabled');
    expect(html).toContain('Disabled');
  });
});
