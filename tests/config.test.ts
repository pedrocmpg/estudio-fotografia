import { lerArquivo } from './helpers/arquivos.ts';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site.config.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import type { SiteConfig } from '../src/config/types.ts';
import { coletarFotos, validarConfig } from '../src/config/validar.ts';
import type { FotoManifesto } from '../src/data/fotos.types.ts';

const manifesto = JSON.parse(lerArquivo('src/data/fotos.manifest.json')) as FotoManifesto[];

function variante(ajuste: (c: SiteConfig) => void): SiteConfig {
  const c = structuredClone(siteConfigAlt);
  ajuste(c);
  return c;
}

describe('validação do config', () => {
  it('o config fictício dos testes é válido', () => {
    expect(validarConfig(siteConfigAlt, manifesto).erros).toEqual([]);
  });

  it('o config real da prévia é válido (só avisos permitidos)', () => {
    expect(validarConfig(siteConfig, manifesto).erros).toEqual([]);
  });

  it('exige WhatsApp só com dígitos, com DDI e DDD', () => {
    for (const ruim of ['+55 11 99999-9999', '11999999999', '', 'abc']) {
      const { erros } = validarConfig(
        variante((c) => (c.negocio.whatsapp = ruim)),
        manifesto,
      );
      expect(erros.some((e) => e.includes('whatsapp'))).toBe(true);
    }
    expect(
      validarConfig(
        variante((c) => (c.negocio.whatsapp = '5511999999999')),
        manifesto,
      ).erros,
    ).toEqual([]);
  });

  it('reprova foto que não existe no manifest', () => {
    const { erros } = validarConfig(
      variante((c) => (c.ctaFinal.foto = 'nao-existe')),
      manifesto,
    );
    expect(erros.join('\n')).toContain('nao-existe');
  });

  it('reprova foto sem alt', () => {
    const semAlt = manifesto.map((f) => (f.id === 'cta-final' ? { ...f, alt: '  ' } : f));
    const { erros } = validarConfig(siteConfigAlt, semAlt);
    expect(erros.join('\n')).toMatch(/alt/);
  });

  it('confere seções repetidas ou inexistentes', () => {
    const dupla = validarConfig(
      variante((c) => c.secoes.push('faixa')),
      manifesto,
    );
    expect(dupla.erros.join('\n')).toContain('duas vezes');
    const falsa = validarConfig(
      variante((c) => c.secoes.push('inventada' as unknown as SiteConfig['secoes'][number])),
      manifesto,
    );
    expect(falsa.erros.join('\n')).toContain('não existe');
  });

  it('confere âncoras de CTA e sessaoId dos pacotes', () => {
    const ancora = validarConfig(
      variante((c) => (c.hero.ctas.primario = { rotulo: 'x', acao: 'ancora', alvo: 'nada' })),
      manifesto,
    );
    expect(ancora.erros.join('\n')).toContain('nada');
    const pacote = validarConfig(
      variante((c) => (c.pacotes.itens[0]!.sessaoId = 'zzz')),
      manifesto,
    );
    expect(pacote.erros.join('\n')).toContain('zzz');
  });

  it('limita título (60) e descrição (155)', () => {
    const { erros } = validarConfig(
      variante((c) => {
        c.meta.titulo = 'x'.repeat(61);
        c.meta.descricao = 'y'.repeat(156);
      }),
      manifesto,
    );
    expect(erros.filter((e) => e.startsWith('meta.'))).toHaveLength(2);
  });

  it('coletarFotos enxerga todas as fotos usadas, inclusive a 3ª cortina e as mobile', () => {
    const ids = coletarFotos(siteConfigAlt).map((f) => f.id);
    expect(ids).toContain('cortina-3e');
    expect(ids).toContain('cortina-1e-m');
    expect(ids).toContain('cta-final');
  });
});
