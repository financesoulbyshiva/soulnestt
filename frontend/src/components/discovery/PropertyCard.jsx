import Card from '../common/Card.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';

const TYPE_KIND = { ROOM: 'room', FLAT: 'flat', PG: 'pg', SHARED_SPACE: 'shared' };
const TYPE_LABEL = { ROOM: 'Room', FLAT: 'Flat / BHK', PG: 'PG', SHARED_SPACE: 'Shared Room' };

export default function PropertyCard({ property, onOpen, saved = false, onSave }) {
  const img = property.images?.[0]?.url;
  return (
    <Card hover className="flex flex-col overflow-hidden">
      <div className="relative">
        {img ? (
          <img src={img} alt={property.title} className="aspect-video w-full object-cover" loading="lazy" />
        ) : (
          <div className="gradient-brand flex aspect-video w-full items-center justify-center text-3xl text-white/80" aria-hidden>⌂</div>
        )}
        <div className="glass absolute left-3 top-3 flex flex-wrap gap-1.5 rounded-full">
          <Badge kind={TYPE_KIND[property.propertyType]} icon="⌂">{TYPE_LABEL[property.propertyType]}</Badge>
          {property.genderPreference === 'FEMALE' && <Badge kind="shared" icon="♀">Female-only</Badge>}
        </div>
        {onSave && (
          <button
            onClick={onSave}
            aria-label={saved ? 'Remove from saved' : 'Save property'}
            className={`glass absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-base ${
              saved ? 'text-danger' : 'text-ink-2'
            }`}
          >
            {saved ? '♥' : '♡'}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-ink">{property.title}</h3>
        <p className="mt-1 text-xs text-ink-2">
          {property.area ? `${property.area} · ` : ''}{property.city}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(property.amenities || []).slice(0, 4).map((a) => (
            <Badge key={a.amenity?.id || a.id} kind="neutral">
              {a.amenity?.name || a.name}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 pt-1">
          <span className="text-xs font-semibold tracking-[0.02em] text-ink-3">
            {property.ownerName ? `by ${property.ownerName}` : 'Verified owner'}
          </span>
          <Button size="sm" variant="secondary" onClick={onOpen}>Explore Space</Button>
        </div>
      </div>
    </Card>
  );
}
