import type { Property } from '@/lib/types'; import { PropertyCard } from './property-card'
export function PropertyGrid({properties}:{properties:Property[]}){return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{properties.map(p=><PropertyCard key={p.id} property={p}/>)}</div>}
