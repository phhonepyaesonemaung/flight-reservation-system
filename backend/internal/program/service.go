package program

import (
	"errors"
	"strings"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListTiers() ([]Tier, error) {
	return s.repo.ListTiers()
}

func (s *Service) GetActiveMembership(userID int) (*ActiveMembership, error) {
	return s.repo.GetActiveMembership(userID)
}

func (s *Service) Purchase(userID int, tierName string) (*ActiveMembership, error) {
	tierName = strings.TrimSpace(strings.ToLower(tierName))
	if tierName != "silver" && tierName != "gold" && tierName != "diamond" {
		return nil, errors.New("tier must be silver, gold, or diamond")
	}
	tier, err := s.repo.GetTierByName(tierName)
	if err != nil {
		return nil, err
	}
	if tier == nil {
		return nil, errors.New("tier not found")
	}
	expiresAt := time.Now().AddDate(0, tier.DurationMonths, 0)
	if err := s.repo.Purchase(userID, tier.ID, expiresAt); err != nil {
		return nil, err
	}
	return &ActiveMembership{
		TierName:        tier.Name,
		DisplayName:     tier.DisplayName,
		DiscountPercent: tier.DiscountPercent,
		ExpiresAt:       expiresAt,
	}, nil
}
