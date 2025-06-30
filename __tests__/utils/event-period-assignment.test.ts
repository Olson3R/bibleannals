import { describe, it, expect } from '@jest/globals';
import { getEventPeriod, groupEventsByPeriod } from '../../app/utils/event-period-assignment';
import type { BiblicalEvent, TimelinePeriod } from '../../app/types/biblical';

describe('Event Period Assignment', () => {
  const mockPeriods: TimelinePeriod[] = [
    {
      name: 'Creation & Pre-Flood Era',
      slug: 'creation-pre-flood',
      dateRange: '4004-2348 BC',
      description: 'From Creation to Noah\'s Flood',
      colorIndex: 0,
      primaryBooks: ['Genesis 1-8']
    },
    {
      name: 'Post-Flood Era',
      slug: 'post-flood',
      dateRange: '2348-2000 BC',
      description: 'After the flood to Abraham',
      colorIndex: 1,
      primaryBooks: ['Genesis 9-11']
    },
    {
      name: 'Intertestamental Period',
      slug: 'intertestamental-period',
      dateRange: '430-6 BC',
      description: 'Between Old and New Testaments',
      colorIndex: 8,
      primaryBooks: ['Historical period between testaments']
    },
    {
      name: 'New Testament Era',
      slug: 'new-testament',
      dateRange: '4 BC-60 AD',
      description: 'Life of Christ and early church',
      colorIndex: 2,
      primaryBooks: ['Matthew', 'Mark', 'Luke', 'John']
    },
    {
      name: 'Apostolic Age',
      slug: 'apostolic-age',
      dateRange: '60-100 AD',
      description: 'Completion of New Testament',
      colorIndex: 3,
      primaryBooks: ['Acts', 'Epistles', 'Revelation']
    }
  ];

  const mockEvents: BiblicalEvent[] = [
    {
      id: 'creation',
      name: 'Creation of the World',
      date: '4004 BC',
      description: 'God creates the heavens and the earth',
      location: 'Universe',
      participants: ['god'],
      biblical_references: ['Gen 1:1'],
      significance: 'Beginning of all things'
    },
    {
      id: 'flood',
      name: 'Noah\'s Flood',
      date: '2348 BC',
      description: 'God destroys the world with flood',
      location: 'Earth',
      participants: ['noah', 'god'],
      biblical_references: ['Gen 7:11'],
      significance: 'Divine judgment'
    },
    {
      id: 'babel',
      name: 'Tower of Babel',
      date: '2200 BC',
      description: 'Confusion of languages',
      location: 'Babel',
      participants: ['nimrod'],
      biblical_references: ['Gen 11:4'],
      significance: 'Scattering of nations'
    },
    {
      id: 'birth-john',
      name: 'Birth of John the Baptist',
      date: '6 BC',
      description: 'John is born to Zacharias',
      location: 'Judea',
      participants: ['john-baptist'],
      biblical_references: ['Luke 1:57'],
      significance: 'Forerunner of Christ'
    },
    {
      id: 'birth-jesus',
      name: 'Birth of Jesus',
      date: '4 BC',
      description: 'Jesus is born in Bethlehem',
      location: 'Bethlehem',
      participants: ['jesus'],
      biblical_references: ['Luke 2:7'],
      significance: 'Incarnation of God'
    },
    {
      id: 'crucifixion',
      name: 'Crucifixion of Jesus',
      date: '30 AD',
      description: 'Jesus dies for sin',
      location: 'Golgotha',
      participants: ['jesus'],
      biblical_references: ['Matt 27:35'],
      significance: 'Atonement for sin'
    },
    {
      id: 'pentecost',
      name: 'Day of Pentecost',
      date: '30 AD',
      description: 'Holy Spirit comes upon disciples',
      location: 'Jerusalem',
      participants: ['peter', 'apostles'],
      biblical_references: ['Acts 2:1'],
      significance: 'Birth of the church'
    },
    {
      id: 'peter-death',
      name: 'Death of Peter',
      date: '64 AD',
      description: 'Peter is martyred in Rome',
      location: 'Rome',
      participants: ['peter'],
      biblical_references: ['John 21:19'],
      significance: 'Apostolic martyrdom'
    }
  ];

  describe('getEventPeriod', () => {
    it('should assign Creation event to Creation & Pre-Flood Era', () => {
      const creation = mockEvents.find(e => e.id === 'creation')!;
      const period = getEventPeriod(creation, mockPeriods);
      
      expect(period).not.toBeNull();
      expect(period!.slug).toBe('creation-pre-flood');
    });

    it('should assign flood event to Post-Flood Era (boundary case)', () => {
      const flood = mockEvents.find(e => e.id === 'flood')!;
      const period = getEventPeriod(flood, mockPeriods);
      
      // The flood (2348 BC) marks the transition, so it goes to Post-Flood Era
      expect(period).not.toBeNull();
      expect(period!.slug).toBe('post-flood');
    });

    it('should assign Tower of Babel to Post-Flood Era', () => {
      const babel = mockEvents.find(e => e.id === 'babel')!;
      const period = getEventPeriod(babel, mockPeriods);
      
      expect(period).not.toBeNull();
      expect(period!.slug).toBe('post-flood');
    });

    it('should handle New Testament Era BC-AD boundary correctly', () => {
      const birthJesus = mockEvents.find(e => e.id === 'birth-jesus')!;
      const period = getEventPeriod(birthJesus, mockPeriods);
      
      expect(period).not.toBeNull();
      expect(period!.slug).toBe('new-testament');
    });

    it('should assign 6 BC event to Intertestamental Period (430-6 BC)', () => {
      const birthJohn = mockEvents.find(e => e.id === 'birth-john')!;
      const period = getEventPeriod(birthJohn, mockPeriods);
      
      // 6 BC should be assigned to Intertestamental Period (430-6 BC)
      expect(period).not.toBeNull();
      expect(period!.slug).toBe('intertestamental-period');
    });

    it('should assign AD events within New Testament Era range', () => {
      const crucifixion = mockEvents.find(e => e.id === 'crucifixion')!;
      const pentecost = mockEvents.find(e => e.id === 'pentecost')!;
      
      const crucifixionPeriod = getEventPeriod(crucifixion, mockPeriods);
      const pentecostPeriod = getEventPeriod(pentecost, mockPeriods);
      
      expect(crucifixionPeriod).not.toBeNull();
      expect(crucifixionPeriod!.slug).toBe('new-testament');
      expect(pentecostPeriod).not.toBeNull();
      expect(pentecostPeriod!.slug).toBe('new-testament');
    });

    it('should assign events after 60 AD to Apostolic Age', () => {
      const peterDeath = mockEvents.find(e => e.id === 'peter-death')!;
      const period = getEventPeriod(peterDeath, mockPeriods);
      
      expect(period).not.toBeNull();
      expect(period!.slug).toBe('apostolic-age');
    });

    it('should return null for events that don\'t fit any period', () => {
      const futureEvent: BiblicalEvent = {
        id: 'future',
        name: 'Future Event',
        date: '2000 AD',
        description: 'An event in the future',
        location: 'Earth',
        participants: [],
        biblical_references: [],
        significance: 'Test case'
      };
      
      const period = getEventPeriod(futureEvent, mockPeriods);
      expect(period).toBeNull();
    });

    it('should handle date parsing edge cases', () => {
      const eventWithTilde: BiblicalEvent = {
        id: 'tilde-date',
        name: 'Event with Approximate Date',
        date: '~30 AD',
        description: 'Event with tilde',
        location: 'Earth',
        participants: [],
        biblical_references: [],
        significance: 'Test case'
      };
      
      const period = getEventPeriod(eventWithTilde, mockPeriods);
      expect(period).not.toBeNull();
      expect(period!.slug).toBe('new-testament');
    });
  });

  describe('groupEventsByPeriod', () => {
    it('should group all events into their correct periods', () => {
      const groupedEvents = groupEventsByPeriod(mockEvents, mockPeriods);
      
      // Check that all periods are initialized
      expect(groupedEvents.size).toBe(mockPeriods.length);
      mockPeriods.forEach(period => {
        expect(groupedEvents.has(period.slug)).toBe(true);
      });
    });

    it('should place Creation events in Creation & Pre-Flood Era', () => {
      const groupedEvents = groupEventsByPeriod(mockEvents, mockPeriods);
      const creationEvents = groupedEvents.get('creation-pre-flood')!;
      
      const creationEventIds = creationEvents.map(e => e.id);
      expect(creationEventIds).toContain('creation');
      // Note: flood goes to Post-Flood Era as it marks the transition
    });

    it('should place Post-Flood events in Post-Flood Era', () => {
      const groupedEvents = groupEventsByPeriod(mockEvents, mockPeriods);
      const postFloodEvents = groupedEvents.get('post-flood')!;
      
      const postFloodEventIds = postFloodEvents.map(e => e.id);
      expect(postFloodEventIds).toContain('babel');
      expect(postFloodEventIds).toContain('flood'); // Flood marks the start of this era
    });

    it('should place New Testament events correctly', () => {
      const groupedEvents = groupEventsByPeriod(mockEvents, mockPeriods);
      const ntEvents = groupedEvents.get('new-testament')!;
      
      const ntEventIds = ntEvents.map(e => e.id);
      expect(ntEventIds).toContain('birth-jesus'); // 4 BC - boundary case
      expect(ntEventIds).toContain('crucifixion'); // 30 AD
      expect(ntEventIds).toContain('pentecost'); // 30 AD
      expect(ntEventIds).not.toContain('birth-john'); // 6 BC - before range
    });

    it('should place Apostolic Age events correctly', () => {
      const groupedEvents = groupEventsByPeriod(mockEvents, mockPeriods);
      const apostolicEvents = groupedEvents.get('apostolic-age')!;
      
      const apostolicEventIds = apostolicEvents.map(e => e.id);
      expect(apostolicEventIds).toContain('peter-death'); // 64 AD
    });

    it('should not duplicate events across periods', () => {
      const groupedEvents = groupEventsByPeriod(mockEvents, mockPeriods);
      
      // Count total events across all periods
      let totalEventsInPeriods = 0;
      groupedEvents.forEach(events => {
        totalEventsInPeriods += events.length;
      });
      
      // Should be less than or equal to original events (some might not fit any period)
      expect(totalEventsInPeriods).toBeLessThanOrEqual(mockEvents.length);
      
      // birth-john (6 BC) should be assigned to Intertestamental Period
      let birthJohnCount = 0;
      groupedEvents.forEach(events => {
        events.forEach(event => {
          if (event.id === 'birth-john') {
            birthJohnCount++;
          }
        });
      });
      expect(birthJohnCount).toBe(1); // Should appear in exactly one period (Intertestamental)
    });

    it('should handle empty events array', () => {
      const groupedEvents = groupEventsByPeriod([], mockPeriods);
      
      expect(groupedEvents.size).toBe(mockPeriods.length);
      groupedEvents.forEach(events => {
        expect(events).toHaveLength(0);
      });
    });

    it('should handle empty periods array', () => {
      const groupedEvents = groupEventsByPeriod(mockEvents, []);
      
      expect(groupedEvents.size).toBe(0);
    });
  });

  describe('Date Logic Edge Cases', () => {
    it('should correctly handle the fixed logic for period assignment', () => {
      // The logic has been fixed to properly handle BC/AD date conversion
      
      const birthJohn = mockEvents.find(e => e.id === 'birth-john')!;
      
      // FIXED: Birth of John (6 BC) is now correctly assigned to Intertestamental Period
      // since 6 BC falls within the Intertestamental Period (430-6 BC)
      const period = getEventPeriod(birthJohn, mockPeriods);
      expect(period).not.toBeNull();
      expect(period!.slug).toBe('intertestamental-period');
    });

    it('should handle BC year comparisons correctly', () => {
      // In BC years, larger numbers are earlier in time
      // So 6 BC is earlier than 4 BC
      // This means 6 BC should NOT be included in a period starting at 4 BC
      
      const testPeriod: TimelinePeriod = {
        name: 'Test Period',
        slug: 'test',
        dateRange: '4 BC-1 BC',
        description: 'Test period',
        colorIndex: 0,
        primaryBooks: []
      };
      
      const event6BC: BiblicalEvent = {
        id: 'test-6bc',
        name: 'Test Event 6 BC',
        date: '6 BC',
        description: 'Test',
        location: 'Test',
        participants: [],
        biblical_references: [],
        significance: 'Test'
      };
      
      const event3BC: BiblicalEvent = {
        id: 'test-3bc',
        name: 'Test Event 3 BC',
        date: '3 BC',
        description: 'Test',
        location: 'Test',
        participants: [],
        biblical_references: [],
        significance: 'Test'
      };
      
      const period6BC = getEventPeriod(event6BC, [testPeriod]);
      const period3BC = getEventPeriod(event3BC, [testPeriod]);
      
      expect(period6BC).toBeNull(); // 6 BC is before period start
      expect(period3BC).not.toBeNull(); // 3 BC is within period
    });
  });
});